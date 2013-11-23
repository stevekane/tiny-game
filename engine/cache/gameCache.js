var _ = require('lodash');

var GameCache = function (caches) {
  var self = this;
  this._caches = {};

  _.forEach(caches, function (cache) {
    self._caches[cache.type] = cache;
  });
};

module.exports = GameCache;
