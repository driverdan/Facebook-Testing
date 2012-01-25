// Adds friend connections for Facebook test users

var FbApp = require('./FbApp').FbApp;
var config = require('./config').config;

var fbapp = new FbApp(config);

// Fetch the user list and find a specific user.
// Good for finding the login URL
fbapp.getUserList(function(testUsers) {
  for (var i = 0, len = testUsers.length; i < len; i++) {
    if (testUsers[i].id === "100003401572018") {
      console.log("Found user", testUsers[i]);
    }
  }
  console.log("done");
});
