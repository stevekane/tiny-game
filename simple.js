var http = require('http')
  , path = require('path');

var _ = require('lodash')
  , Q = require('q');

var requestAnimationFrame = require('raf-shim')(window).requestAnimationFrame
  , Loader = require('asset-gopher');


var commander = require('./libs/commander/commander');

var Cache = function (hash) {
  var hash = hash || {};

  _.extend(this, hash);
};

var Clock = function () {
  this.timeStamp = null;
  this.startTime = null;
  this.stopTime = null;
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

var loadCache = _.curry(function (cache, assets) {
  _.extend(cache, assets);
  return cache;
});


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
    var now = Date.now();

    var dT = now - clock.timeStamp;
    clock.timeStamp = now;

    advanceScene(game.activeScene, dT);
    requestAnimationFrame(innerLoop);
  };
}

var startGame = function (game) {
  var now = Date.now();

  if (!game.activeScene) return game;

  game.clock.startTime = now;
  game.clock.timeStamp = now;
  requestAnimationFrame(loop(game));
  return game;
};

var stopGame = function (game) {
  var now = Date.now();

  if (!game.activeScene) return game;

  game.clock.stopTime = now;
  cancelAnimationFrame(loop(game));
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

var indexLoadedAssets = function (fetchedAssets) {
  return _.chain(fetchedAssets)
    .where("succeeded")
    .pluck("asset")
    .indexBy("name")
    .value();
};


/**
GAME
*/
//setup objects to construct our game instance
var gameboard = document.getElementById('game')
  , clock = new Clock()
  , cache = new Cache()
  , camera = new Camera()
  , board = new Board(gameboard)
  , loader = new Loader()
  , inputHandler = commander.DefaultCommander();

var loadingAssets = [
  new Loader.Asset("/images/test.png", "image", "testImage"),
  new Loader.Asset("/images/not-real.png", "image", "notFound"),
  new Loader.Asset("/json/spritesheet.json", "json", "spritesheet"),
  new Loader.Asset("/json/missing.json", "json", "missingJson")
];

var loadingBindings = [];
var titleBindings = [];
var gameBindings = [];

var scenes = {
  loading: new Scene("loading", board, inputHandler, camera, loadingBindings),
  title: new Scene("title", board, inputHandler, camera, titleBindings),
  game: new Scene("game", board, inputHandler, camera, gameBindings)
};


loader.fetchMany(loadingAssets)
.then(indexLoadedAssets)
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
