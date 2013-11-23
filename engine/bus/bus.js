var inherits = require("util").inherits
  , events = require("events")
var _ = require('lodash')
  , throwIf = require('../../libs/exceptions/exceptions').throwIf
  , isNone = require('../../libs/conditionals/conditionals').isNone;

/**
What is a bus?
It is a network of connected objects 
that can register themselves by name
and can receive data from other objects through
a common connection.  

The bus may be instantiated w/ an array of subscribers
which are just POJOs.  The pojos themselves must be wrapped
in k/v pairs which identify them
eg. {game: {}} or {menuscene: {}}
*names must be unique to the bus

subscribers can connect or disconnect to a bus 

when a subscriber connects, a connection event is emitted
when a subscriber disconnects, a disconnection event is emitted
when a subscribers publishes an event, the event is published
as {emitterName: emitter, eventName: eventName, data}

The entire purpose of this is to decouple the objects in our game
as much as fucking humanly possible.  We will pass around data
instead of doing complex dependency injections and thus we will win
*/

var Bus = function (name, options) {
  var options = options || {};
  throwIf("No name provided to constructor", isNone(name));

  _.extend(this, options);
  this.name = name;
  this.subscribers = {};
};

//here we are inheriting from node's EventEmitter
inherits(Bus, events.EventEmitter);

Bus.prototype.addSub = function (name, subscriber) {
  throwIf("No name provided to addSub", isNone(name));
  throwIf("No subscriber provided to addSub", isNone(subscriber));
  throwIf(
    "subscriber by name " + name + " already exists", 
    alreadySubscribed(this.subscribers, name)
  );
  this.subscribers[name] = subscriber;
  return this;
};

Bus.prototype.removeSub = function (name) {
  throwIf("No name provided to removeSub", isNone(name));
  this.subscribers[name] = undefined;
  return this;
};

module.exports = Bus;

var alreadySubscribed = _.has;
