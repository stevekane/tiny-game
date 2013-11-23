var assert = require('chai').assert;
var Bus = require('./../engine/bus/bus');

suite("Bus");
var bus = new Bus("test-bus");

test("it should exist and should instantiated an objects", function () {
  assert.isDefined(Bus, "Bus constructor is defined");
  assert.isDefined(bus, "bus is defined");
});

test("it should throw if no name (string) provided as first arg", function () {
  assert.throws(function () {
    var bus = new Bus(); 
  });
});

test("should accept name as first arg which it sets on object", function () {
  var bus = new Bus("test");
  assert.equal("test", bus.name, "name is defined on bus instance");
});

test("should define an empty object of subscribers on construction", function () {
  assert.isObject(bus.subscribers, "subscribers object instantiated");
});

//ADDSUB
suite("addSub");
test("it should throw if no name or sub is not provided", function () {
  assert.throws(function () {
    bus.addSub();
  });
  assert.throws(function () {
    bus.addSub("testsub");
  });
  assert.doesNotThrow(function () {
    bus.addSub("testsub", {});
  });
});

test("it should return the bus itself", function () {
  var bus = new Bus("test-bus");
  var returned = bus.addSub("sub1", {});
  assert.equal(bus, returned, "addSub returns the bus");
});

test("it should throw if the provided name is already a subscriber", function() {
  assert.throws(function () {
    var bus = new Bus("test-bus")
      .addSub("sub1", {})
      .addSub("sub1", {});
  });
});

test("it should add the subscriber to the subscribers object by name", function () {
  var bus = new Bus("test-bus")
    .addSub("sub1", {})
    .addSub("sub2", {});
});

//REMOVESUB
suite("removeSub");
test("it should throw if no name is provided", function () {
  assert.throws(function () {
    var bus = new Bus("test-bus");
    bus.removeSub();
  });
  assert.doesNotThrow(function () {
    var bus = new Bus("test-bus");
    bus.removeSub("wanker");
  });
});

test("if should remove the subscriber by name from subscribers", function () {
  var bus = new Bus("test-bus")
    .addSub("sub1", {})
    .removeSub("sub1");

  assert.isUndefined(bus.subscribers.sub1, "sub1 is not found on subscribers");
});

test("it should return the bus itself", function () {
  var bus = new Bus("test-bus");
  var returned = bus.removeSub("sub1", {});
  assert.equal(bus, returned, "removeSub returns the bus");
});

//EMIT
suite("emit");
test("it should exist and be a function", function () {
  assert.isDefined(bus.emit, "emit is defined");
  assert.isFunction(bus.emit, "emit is a function");
});
