var assert = require('chai').assert;
var Cache = require('./../engine/cache/cache');
var GameCache = require('./../engine/cache/gameCache');

var gameCacheManager = require('./../engine/cache/gameCacheManager');
var cacheManager = require('./../engine/cache/cacheManager');

suite("GameCache");
var gameCache = new GameCache();

it("should exist and should create an instance", function () {
  assert.isFunction(GameCache, "GameCache constructor exists");
  assert.isObject(gameCache, "gameCache instance exists");
});

it("should assign provided caches to itself by type", function () {
  var cache = new Cache({default: "pinky", type: "test"});
  var gameCache = new GameCache([cache]);  
  var retrievedCache = gameCacheManager.getCacheByType(gameCache, "test");
  assert.isDefined(retrievedCache);
});

suite("gameCacheManager.addCache");
test("it should add an additional cache to the gameCacheManager instance", function () {
  var gameCache = new GameCache();
  var testCache = new Cache({type: "test"});
  var retrievedCache;

  gameCacheManager.addCache(gameCache, testCache);
  retrievedCache = gameCacheManager.getCacheByType(gameCache, "test");
  assert.isDefined(retrievedCache, "test type is defined");
});
