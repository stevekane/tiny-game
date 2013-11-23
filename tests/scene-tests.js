var assert = require('chai').assert;
var Scene= require('./../engine/scene/scene');

suite("Scene");
var scene = new Scene("test");

test("it should exist", function () {
  assert.isDefined(scene);
});

test("it should throw if no name is provided to constructor", function () {
  assert.throws(function() {
    var scene = new Scene(null);
  });
});

test("", function () {

});
