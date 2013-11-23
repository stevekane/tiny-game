var assert = require('chai').assert;
var Game = require('./../engine/game/game');

suite("Game");
var game = new Game({}, {});

test("it should exist", function () {
  assert.isDefined(game, "Game object exists");
});

test("it should throw if no sceneTree is provided", function () {
  assert.throws(function () {
    var game = new Game(null, {}); 
  }); 
});

test("it should have attributes passed in as options", function () {
  var name = "test game";
  var game = new Game({}, {name: name});

  assert.equal(game.name, name);
});

test("it should not be running after construction", function () {
  var game = new Game({});

  assert.isFalse(game.isRunning, "game is not running after construction");
});


suite("Game.start");
test("it should cause the game to be running", function () {
  game.start();
  assert.isTrue(game.isRunning, "start causes the game to start running");
});

suite("Game.pause");
test("it should cause the game to stop running", function () {
  game.pause();
  assert.isFalse(game.isRunning, "start causes the game to stop running");
});
