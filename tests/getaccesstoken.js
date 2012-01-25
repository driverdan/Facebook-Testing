// Adds friend connections for Facebook test users

var FbApp = require('../FbApp').FbApp;
var config = require('../config').config;

var fbapp = new FbApp(config);

// Clear the access token to be sure it's set later
fbapp.appAccessToken = "";

fbapp.getAccessToken(function(token) {
  console.log("Response: " + token);

  var tokenSplit = token.split("=");

  if (tokenSplit.length >= 2 && tokenSplit[0] === "access_token") {
    console.log("Token fetched successfully");

    if (fbapp.appAccessToken === token) {
      console.log("fbapp.appAccessToken set correctly");
    } else {
      console.log("fbapp.appAccessToken not set correctly: " + fbapp.appAccessToken);
    }
  } else {
    console.log("Token fetch FAILED");
  }
});
