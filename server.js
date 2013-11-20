var connect = require('connect')
  , staticFileDir = __dirname 
  , port = 1234;

connect()
  .use(connect.static(staticFileDir))
  .listen(port);
