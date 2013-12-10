var http = require('http');
var _ = require('lodash');
var Q = require('q');
var path = require('path');
var commander = require('./libs/commander/commander');
var requestAnimationFrame = require('raf-shim')(window).requestAnimationFrame;

var Asset = function (name, url, value) {
  this.name = name;
  this.url = url;
  this.value = value;
};

var Cache = function (hash) {
  var hash = hash || {};

  _.extend(this, hash);
};

var Clock = function () {
  this.timeStamp = null;
  this.startTime = null;
  this.stopTime = null;
  this.isRecording = null;
};

var Camera = function () {};

var Board = function (canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
};

//for now, we are using keydrown directly...kinda nub
var InputHandler = function () {
  this.tick = function () {};
};

var Scene = function (name, board, inputHandler, camera, keyBindings) {
  this.name = name;
  this.board = board;
  this.inputHandler = inputHandler;
  this.camera = camera;
  this.keyBindings = keyBindings;
};

var Game = function (cache, clock, scenes) {
  this.cache = cache;
  this.clock = clock;
  this.scenes = scenes || {};
};

var fetchImage = function (asset) {
  var imagePromise = Q.defer()
    , image = new Image();

  image.addEventListener("load", function (params) {
    return imagePromise.resolve(asset);
  });
  image.addEventListener("error", function (err) {
    return imagePromise.reject(err);
  });
  image.src = asset.url;
  asset.value = image;

  return imagePromise.promise;
}

//performant fetch using streams and other node craziness
var fetchJSON = function (asset) {
  var JSONPromise = Q.defer();

  http.get({path: asset.url}, function (res) {
    var body = ""
      , json;

    res.on("data", function (chunk) {
      body += chunk; 
    });
    res.on("end", function () {
      var parseSuccessful = true;

      try {
        json = JSON.parse(body);  
      } catch (e) {
        parseSuccessful = false;
      }

      if (parseSuccessful) {
        asset.value = json; 
        JSONPromise.resolve(asset);
      } else {
        asset.value = null; 
        JSONPromise.reject(new Error("Invalid JSON"));
      }
    });
  })  
  .on("error", function (err) {
    return JSONPromise.reject(err);
  });

  return JSONPromise.promise;
};

var fetchBadAsset = function (asset) {
  var failedPromise = Q.defer();
  failedPromise.reject(new Error("Invalid extension type"));
  return failedPromise.promise;
};

var fetchAsset = function (asset) {
  var fetchPromise;

  switch (path.extname(asset.url)) {
    case ".png":
    case ".jpg":
      fetchPromise = fetchImage(asset);
      break;
    case ".json":
      fetchPromise = fetchJSON(asset);
      break;
    default:
      fetchPromise = fetchBadAsset(asset);
      break;
  }

  return fetchPromise;
};

var fetchAssets = function (assets) {
  var fetchPromises = _.map(assets, fetchAsset);

  return Q.allSettled(fetchPromises)
  .then(function (results) {
    return _.chain(results)
      .where({state: "fulfilled"})
      .pluck("value")
      .indexBy("name")
      .value();
  });
};

var loadCache = _.curry(function (cache, assets) {
  _.extend(cache, assets);
  return cache;
});

var startClock = function (clock) {
  var timeStamp = Date.now();

  clock.startTime = timeStamp;
  clock.timeStamp = timeStamp;
  clock.isRecording = true;
  return timeStamp;
}

var stopClock = function (clock) {
  clock.timeStamp = null;
  clock.stopTime = Date.now();
  clock.isRecording = false;
  return clock.stopTime;
};

var getDeltaT = function (clock) {
  var timeStamp = Date.now()
    , dT = timeStamp - clock.timeStamp;

  clock.timeStamp = timeStamp;
  return clock.isRecording ? dT : 0;
}

//Psuedo deterministic...uses rand and has no inputs
var getRandomColor = function () {
  return "#" + Math.random().toString(16).slice(2, 8);
}

var processInputs = function (scene, dT) {
  scene.inputHandler.tick(dT);
  return scene;
}

var updateScene = function (scene, dT) {
  return scene;
}

var drawScene = function (scene, dT) {
  var height = board.canvas.height
    , width = board.canvas.width;
  
  //clear old layer completely
  board.ctx.clearRect(0, 0, width, height);
  //draw background layers
  board.ctx.fillStyle = "#123456";
  board.ctx.fillRect(0, 0, width, height);

  //draw foreground text
  board.ctx.fillStyle = "#fff333";
  board.ctx.fillText("Time" + dT + " ms", 0, 10);
  board.ctx.fillText("SceneName: " + scene.name, 0, 20);
  return scene;
}

var advanceScene = function (scene, dT) {
  processInputs(scene, dT);
  updateScene(scene, dT);
  drawScene(scene, dT);
  return scene;
}

//we close over our game object... yay
var loop = function (game) {
  return function innerLoop () {
    var dT = getDeltaT(game.clock);

    advanceScene(game.activeScene, dT);
    requestAnimationFrame(innerLoop);
  };
}

var startGame = function (game) {
  if (!game.activeScene) return game;

  startClock(game.clock);
  requestAnimationFrame(loop(game));
  return game;
};

var stopGame = function (game) {
  if (!game.activeScene) return game;

  stopClock(game.clock); 
  window.cancelAnimationFrame(loop(game));
  return game;
}

var activateScene = function (sceneName, game) {
  var targetScene = game.scenes[sceneName];

  if (!targetScene) {
    throw new Error("invalid scene name ", sceneName); 
  }

  game.activeScene = targetScene;
  return game;
}

/**
GAME
*/
//setup objects to construct our game instance
var gameboard = document.getElementById('game')
  , clock = new Clock()
  , cache = new Cache()
  , camera = new Camera()
  , board = new Board(gameboard)
  , inputHandler = commander.DefaultCommander();

var loadingAssets = [
  new Asset("test", "/images/test.png"),
  new Asset("fake", "/images/not-real.png"),
  new Asset("characters", "/json/spritesheet.json"),
  new Asset("missingjson", "/json/missing.json"),
  new Asset("badjson", "/json/bad.json"),
  new Asset("unsupported", "/fake/object.ext")
];

var loadingBindings = [];
var titleBindings = [];
var gameBindings = [];

var scenes = {
  loading: new Scene("loading", board, inputHandler, camera, loadingBindings),
  title: new Scene("title", board, inputHandler, camera, titleBindings),
  game: new Scene("game", board, inputHandler, camera, gameBindings)
};


fetchAssets(loadingAssets)
.then(loadCache(cache))
.then(function (cache) {
  return new Game(cache, clock, scenes);})
.then(function (game) {
  activateScene("loading", game); 
  startGame(game);
})
.then(null, function (err) {
  console.log(err.stack);
})
.done();
