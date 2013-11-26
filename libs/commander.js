var _ = require('lodash');

//polyfil for adding event listeners
var documentOn = function (eventName, handler) {
  if (window.addEventListener) {
    window.addEventListener(eventName, handler, false); 
  } else if (document.attachEvent) {
    document.attachEvent('on' + eventName, handler); 
  }
}

var setupHandlers = function (commander) {
  documentOn('keydown', function (event) {
    var command= newCommand(commander.commandPool);
    _.extend(command, {
      keyCode: event.keyCode,
      state: "down",
      data: {timeStamp: Date.now()}
    });
    commander.commandQueue.push(command);
  });   

  documentOn('keyup', function (event) {
    var command= newCommand(commander.commandPool);
    _.extend(command, {
      keyCode: event.keyCode,
      state: "up",
      data: {timeStamp: Date.now()}
    });
    commander.commandQueue.push(command);
  });
};

var CommandPool = function (size, Constructor) {
  for (var i=0; i<size; i++) {
    this.push(new Constructor()); 
  }
};

CommandPool.prototype = Array.prototype;

var newCommand = function (commandPool) {
  var newCommand = _.find(commandPool, "new");
  newCommand.new = false;
  return newCommand;
};

var resetCommand = function (command) {
  _.extend(command, {
    keyCode: "",
    state: "",
    data: {},
    new: true 
  });
};

var Command = function (keyCode, state, data) {
  this.keyCode = keyCode || "";
  this.state = state || "";
  this.data = data || {};
  this.new = true;
}

var Commander = function (options) {
  var options = options || {};

  this.commandPool = new CommandPool(50, Command);
  this.commandQueue = options.target ? options.target : [];
  setupHandlers(this);
};

Commander.prototype = Object.create({});

Commander.prototype.tick = function (dT) {
  console.log(this.commandQueue); 
  _.forEach(this.commandQueue, function (command) {
    resetCommand(command); 
  });
  this.commandQueue = [];
}

Commander.prototype.run = function (fn) {
  var commander = this;

  window.requestAnimationFrame(function () {
    commander.run(fn);
    fn();
  });
}

module.exports = Commander;
