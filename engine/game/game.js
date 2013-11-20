var _ = require('lodash')
  , throwIf = require('../../libs/exceptions/exceptions').throwIf
  , isNone = require('../../libs/conditionals/conditionals').isNone
  , nextTick = require('../../libs/raf-shim/raf-shim');

var Game = function (sceneTree, options) {
  var options = options || {};
  throwIf("No scene tree provided to constructor", isNone(sceneTree));
  
  _.extend(this, options);
  this.sceneTree = sceneTree;
};

Game.prototype.start = function () {
             
}

Game.prototype.stop = function () {
  
}

Game.prototype.pause = function () {
  
}

module.exports = Game;
