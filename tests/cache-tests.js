var assert = require('chai').assert;
var Cache = require('./../engine/cache/cache');
var cacheManager = require('./../engine/cache/cacheManager');

suite("Cache");
var cache = new Cache("test-cache");

test("it should exist and shouwl create an instance", function () {
  assert.isDefined(Cache, "Cache constructor is defined");
  assert.isDefined(cache, "cache instance is created");
});

test("it should assign parameter default if provided", function () {
  var defaultValue = 1234;
  var cache = new Cache({default: defaultValue});
  assert.equal(cache.default, defaultValue, "retrieved default value");
});

test("it should assign an optional type to the cache if provided", function () {
  var type = "test-type";
  var cache = new Cache({type: type});
  assert.equal(cache.type, type, "type was assigned to cache");
});

suite("cacheManager");
test("it should exist", function () {
  assert.isDefined(cacheManager, "cachemanager is defined");
});

suite("cache");
test("it should exist", function () {
  assert.isFunction(cacheManager.cache, "cache is a function");
});

test("it should add the k/v pair to the cache", function () {
  var cache = new Cache()
    , cachedValue;

  cacheManager.cache(cache, "sample.png", "123123123123");
  cachedValue = cacheManager.getByName(cache, "sample.png");
  assert.isDefined(cachedValue, "value was cached");
});
