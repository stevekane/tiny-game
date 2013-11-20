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

test("#start", function () {
  assert.isFunction(game.start, "Start method exists");
});

test("#stop", function () {
  assert.isFunction(game.stop, "Stop method exists");
});

test("#pause", function () {
  assert.isFunction(game.pause, "Pause method exists");
});
