/**
Special thanks to keydrown for motivating this module.

Browsers emit keyup and keydown events promptly but there is
a rather large and noticeable delay before calling subsequent
keydown events.  In other words, the pulse of keyboard events
is nowhere near 60 events/second meaning that there will be 
serious inaccuracy in your keydown event handlers if they are
expected to be precise.  This is especially noticeable when 
pushing down and holding a key is intended to have immediate
affects.  

To get around this limitation, we do the following:

keydown -> Store this event in an array of keyDownEvents
keyup -> Remove the corrosponding key from keyDownEvents
tick -> check keyDownEvents array and queue up that event with an updated timeStamp

To a consumer of keyboard events, this means they will have access 
to a fresh set of keyboard events on every tick.  Some of these events
will be copies of the original keydown event w/ updated timestamps
*/
var find = function (array, propName) {
  var found = null;

  for (var i=0, len=array.length; i<len; i++) {
    if (array[i][propName]) {
      found = array[i];  
      break;
    }
  }

  return found;
}

var Commander = function (options) {
  this.commandQueue = options.commandQueue || [];
  this.commandPool = [];
}
