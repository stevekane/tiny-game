var http = require('http');
var _ = require('lodash');
var Q = require('q');
var path = require('path');
var keydrown = require('./vendor/keydrown.min');
//we want to null out the global kd object
window.kd = null;

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

var Board = function (canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
};

//for now, we are using keydrown directly...kinda nub
var InputHandler = function (keydrown) {
  this.bindings = keydrown;
  this.tick = keydrown.tick;
};

var Game = function (board, inputHandler, cache) {
  this.board = board;
  this.inputHandler = inputHandler;
  this.cache = cache;
  this.clock = new Clock();
  this.scene = "test-scene";
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
}

var fetchBadAsset = function (asset) {
  var failedPromise = Q.defer();
  failedPromise.reject(new Error("Invalid extension type"));
  return failedPromise.promise;
}

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

var handleInputs = function (inputHandler, dT) {
  inputHandler.tick(dT);
}

var updateScene = function (scene, dT) {
  return scene;
}

var drawWorld = function (board, dT) {
  var height = board.canvas.height
    , width = board.canvas.width;
  
  //clear old layer completely
  board.ctx.clearRect(0, 0, width, height);
  //draw background layers
  board.ctx.fillStyle = "#123456";
  board.ctx.fillRect(0, 0, width, height);

  //draw foreground text
  board.ctx.fillStyle = getRandomColor();
  board.ctx.fillText("Time" + dT + " ms", 0, 10);
}

//we close over our game object... yay
var loop = function (game) {
  return function innerLoop () {
    var dT = getDeltaT(game.clock);

    handleInputs(game.inputHandler, dT);
    updateScene(game.scene, dT);
    drawWorld(game.board, dT);
    window.requestAnimationFrame(innerLoop);
  };
}

var createGame = _.curry(function (board, inputHandler, cache) {
  return new Game(board, inputHandler, cache);
});

var startGame = function (game) {
  startClock(game.clock);
  window.requestAnimationFrame(loop(game));
};

var stopGame = function (game) {
  stopClock(game.clock); 
  window.cancelAnimationFrame(loop(game));
}

/**
GAME
*/

//This is ghetto.  We can fix it later.  Should not be so tightly coupled
//to keydrown at this level of API
var registerKeyBindings = function (game) {
  var bindings = game.inputHandler.bindings;

  bindings.SPACE.down(function () {
    console.log(game.scene);
  });
  bindings.SPACE.up(function () {
    console.log("Space has been released");
  });

  return game;
}

var assets = [
  new Asset("test", "/images/test.png"),
  new Asset("fake", "/images/not-real.png"),
  new Asset("characters", "/json/spritesheet.json"),
  new Asset("missingjson", "/json/missing.json"),
  new Asset("badjson", "/json/bad.json"),
  new Asset("unsupported", "/fake/object.ext")
];

//setup objects to construct our game instance
var gameboard = document.getElementById('game')
  , cache = new Cache()
  , board = new Board(gameboard)
  , inputHandler = new InputHandler(keydrown);

fetchAssets(assets)
.then(loadCache(cache))
.then(createGame(board, inputHandler))
.then(registerKeyBindings)
.then(startGame)
.done();
