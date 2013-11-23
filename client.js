var Game = require('./engine/game/game.js');
var Bus = require('./engine/bus/bus.js');

var game = new Game({}, {name: "booty"});
var subscriber = {update: "beep boop"};
var bus = new Bus("mybus");
bus.addSub("mySub", subscriber);
subscriber.bus = bus;

subscriber.bus.on("test", function () {
  console.log(this);
});

subscriber.bus.emit("test");
//game.start();
