var _ = require('lodash');

//UTILS

//polyfill for adding event listeners
var documentOn = function (eventName, handler) {
  if (window.addEventListener) {
    window.addEventListener(eventName, handler, false); 
  } else if (document.attachEvent) {
    document.attachEvent('on' + eventName, handler); 
  }
}

//polyfill for removing event listeners
var documentOff = function (eventName, handler) {
  if (window.addEventListener) {
    window.removeEventListener(eventName, handler, false); 
  } else if (document.attachEvent) {
    document.detachEvent('on' + eventName, handler); 
  }
}

//shim for RAF
var requestAnimFrame = function () {
  return window.requestAnimationFrame ||
    window.webketRequestAnimationFrame ||
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60); 
    };
}()

//DATA MODELS

/**
 * Command is a "reified" keyboard event that captures a key action
*/
var Command = function (hash) {
  _.extend(this, hash);
  this.reset();
  this.isNew = true;
}

Command.prototype = Object.create({});

/**
 * Define what should happen when you reset your Command object
 * Generally, you would probably just set any fields you captured back
 * to some appropriate default values.
 * N.B. Be sure you set "new" to true
*/
Command.prototype.reset = function () {
  _.extend(this, {
    keyCode: "",
    state: "",
    timeStamp: null,
    isNew: true 
  });
};

/**
 * Define what should happen when a keydown event ("keyPress" in our parlance)
 * happens.  This may be overriden specifically or the whole Command object
 * may be overridden
 *
 * @param { event } event keydown DOM event
*/
Command.prototype.captureKeyPress = function (event) {
  _.extend(this, {
    keyCode: event.keyCode,
    state: "press",
    timeStamp: Date.now(),
  });
};

/**
 * Define what should happen when a keyup event happens.  This may be overriden 
 * specifically or the whole Command object may be overridden
 * @param { event } event keyup DOM event
*/
Command.prototype.captureKeyUp = function (event) {
  _.extend(this, {
    keyCode: event.keyCode,
    state: "up",
    timeStamp: Date.now(),
  });
};

/**
 * Define what should happen when a "Commander keydown event" is detected
 * N.B. Commander events are NOT real DOM events!!
 * The event that is passed to you is the event that was fired when the key
 * was originally pressed
 * @param { event } event The original event that triggered the keyDown!
*/
Command.prototype.captureKeyHeld = function (event) {
  _.extend(this, {
    keyCode: event.keyCode,
    state: "down",
    timeStamp: Date.now(),
  });
};

/**
 * The command pool is a re-useable pool of Command objects that will be 
 * "reset" during every tick of your application's event loop
 *
 * Command pool inherits from Array.  It constructs an array of objects
 * of provided size.  You may supply a constructor for the command objects
 * @param { number } size Length of the generated array
 * @param { function } Constructor Constructor for Command objects
*/
var CommandPool = function (size, Constructor) {
  for (var i=0; i<size; i++) {
    this.push(new Constructor()); 
  }
};

CommandPool.prototype = Array.prototype;

/**
 * Find and return a Command instance where attr new is true
 * set new to false before returning
*/
CommandPool.prototype.findNew = function () {
  var newCommand = _.find(this, "isNew");
  newCommand.isNew = false;
  return newCommand;
};

/**
 * Commander is an object that, when created, attaches keyboard event listeners
 * to the document/window that will capture keyboard inputs and generate Command
 * objects which capture useful data about the event and allow delayed processing
 * of that event until an appropriate time
 *
 * The Commander's tick method will flush the command Queue and then add keys that 
 * are still pressed to the command Queue
 * 
 * @param { CommandPool } commandPool Instance of CommandPool provided to constructor
 * @param { Array } commandQueue This is an optional external array provided to the 
 * constructor that will be filled with Command objects on every run of Commander.tick
*/
var Commander = function (commandPool, commandQueue) {
  this.commandPool = commandPool;
  this.commandQueue = commandQueue ? commandQueue : [];
  this.keyDownEvents = [];
  attachHandlers(this);
};

Commander.prototype = Object.create({});

/**
 * this function should be called once per turn of your app's event loop
 * 
 * first, reset all Commands in the commandQueue and commandQueue itself
 * second, review the list that contains keyDown events and generate Commands
 * for them using commander.handlers._key
 * @param { number } dT delta time since last tick was called (optional)
*/
Commander.prototype.tick = function (dT) {
  var self = this;

  _.forEach(this.commandQueue, function (command) {
    command.reset();
  });

  this.commandQueue = [];

  _.forEach(this.keyDownEvents, function (event) {
    self.handlers._keyHeld(event);
  });
};

/**
 * Cleanup event listeners and destroy self
*/
Commander.prototype.destroy = function () {
  removeHandlers(this);
  delete this;
};

var pushUnique = function (array, obj) {
  
  if (!_.some(array, obj)) {
    array.push(obj);
  }
  return array;
};

var remove = _.remove;

var contains = _.some;

//Attach our bound event handlers
var attachHandlers = function (commander) {

  //define functions to close over commander instance
  commander.handlers = {

    //if this key is not currently registered as down, this is a new
    //key press and it should be registered in the commandQueue
    _keyPress: function (event) {
      //early escape if this key is already down
      if (contains(commander.keyDownEvents, {keyCode: event.keyCode})) {
        return; 
      }

      var command = commander.commandPool.findNew();

      command.captureKeyPress(event);
      commander.commandQueue.push(command);
      pushUnique(commander.keyDownEvents, {keyCode: event.keyCode});
    },

    //remove events with this keyCode from keyDownEvents
    _keyUp: function (event) {
      var command = commander.commandPool.findNew();

      command.captureKeyUp(event);
      commander.commandQueue.push(command);
      remove(commander.keyDownEvents, {keyCode: event.keyCode});
    },

    //if we tab away from browser, reset held keys
    _blur: function (event) {
      commander.keyDownEvents = [];
    },

    //these are fired during Commander tick events and track depressed keys
    _keyHeld: function (event) {
      var command = commander.commandPool.findNew(); 

      command.captureKeyHeld(event);
      commander.commandQueue.push(command);
    }
  };

  documentOn('keydown', commander.handlers._keyPress);
  documentOn('keyup', commander.handlers._keyUp);
  documentOn('blur', commander.handlers._blur);
};

//Remove our bound event handlers
var removeHandlers = function (commander) {
  documentOff('keydown', commander.handlers._keyPress);
  documentOff('keydown', commander.handlers._keyUp);
  documentOff('blur', commander.handlers._blur);
};

module.exports.Commander = Commander;
module.exports.CommandPool = CommandPool;
module.exports.Command= Command;
module.exports.DefaultCommander = function () {
  var commandPool = new CommandPool(30, Command);
  return new Commander(commandPool);
}
