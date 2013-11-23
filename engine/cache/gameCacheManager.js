var GameCacheManager = function () {};

var addCache = function (gamecache, cache) {
  gamecache._caches[cache.type || "default"] = cache;
}

var getCacheByType = function (gamecache, type) {
  return gamecache._caches[type]; 
}

module.exports = {
  addCache: addCache,
  getCacheByType: getCacheByType
};
