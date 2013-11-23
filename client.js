var Game = require('./engine/game/game.js');
var Cache = require('./engine/cache/cache');
var GameCache = require('./engine/cache/gameCache');
var gameCacheManager = require('./engine/cache/gameCacheManager');

var cache = new Cache({type: "test", default: "wanker"});
var gameCache = new GameCache([cache]);

console.log(gameCache);
console.log(gameCacheManager.getCacheByType(gameCache, "test"));
