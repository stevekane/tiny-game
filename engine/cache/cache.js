var inherits = require('util').inherits;
/**
What is the point of a cache?


A cache is an in-memory store of data that is stored by name
and may be retrieved by name at any time.  

Data may be required by an application through asyncronous actions but not used until the data is actually available.

We thus may want to load data our application will need prior to 
using it to perform actions in our app (eg. instantiating objects
or sending data elsewhere).

*/

var Cache = function (options) {
  var options = options || {};

  this.type = options.type || "";
  this.default = options.default || null;
  this._cache = {};
};

inherits(Cache, Object);

module.exports = Cache;
