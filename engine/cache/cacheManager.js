var _ = require('lodash')
  , throwIf = require('../../libs/exceptions/exceptions').throwIf
  , isNone = require('../../libs/conditionals/conditionals').isNone
  , inherits = require('util').inherits;

var cache = function (cache, name, value) {
  cache._cache[name] = value; 
  return cache;
}

var getByName = function (cache, name) {
  return cache._cache[name] || cache._default;
}

module.exports = {
  cache: cache,
  getByName: getByName
}
