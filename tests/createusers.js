// Adds friend connections for Facebook test users

var FbApp = require('../FbApp').FbApp;
var config = require('../config').config;

var fbapp = new FbApp(config);

// Should create 10 users
// FB's current limit is 500 per app

// Fetch list, create users, then confirm there are 10 new ones
fbapp.getUserList(function(testUsers) {
  console.log("Done fetching user list. Creating 10 users...");

  fbapp.createUsers(10, function() {
    console.log("Done creating users. Verifying...");

    fbapp.getUserList(function(users) {
      console.log(testUsers.length + " original users, now " + users.length + " users");
    });
  });
});
