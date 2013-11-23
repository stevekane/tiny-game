var _ = require('lodash')
  , throwIf = require('../../libs/exceptions/exceptions').throwIf
  , isNone = require('../../libs/conditionals/conditionals').isNone;

var Scene = function (name, options) {
  var options = options || {};
  throwIf("No name proided to constructor", isNone(name));
  this.name = name;

  _.extend(this, options);
}

module.exports = Scene;
