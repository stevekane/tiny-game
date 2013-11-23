var _ = require('lodash')
  , throwIf = require('../../libs/exceptions/exceptions').throwIf
  , isNone = require('../../libs/conditionals/conditionals').isNone
  , nextTick = require('../../libs/raf-shim/raf-shim');

var updateGame = function (game) {
  var update = function () {
    if (!game.isRunning) return;
    
    nextTick(update); 
  }
  return update;
}

var Game = function (sceneTree, options) {
  var options = options || {};
  throwIf("No scene tree provided to constructor", isNone(sceneTree));
  
  _.extend(this, options);
  this.sceneTree = sceneTree;
  this.isRunning = false;
}

Game.prototype.start = function () {
  this.isRunning = true; 
  nextTick(updateGame(this));
}

Game.prototype.pause = function () {
  this.isRunning = false; 
}

module.exports = Game;
