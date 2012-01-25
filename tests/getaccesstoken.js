// Adds friend connections for Facebook test users

var FbApp = require('../FbApp').FbApp;
var config = require('../config').config;

var fbapp = new FbApp(config);

fbapp.getAccessToken(function(token) {
  console.log("Token: " + token);
});
