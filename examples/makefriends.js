// Adds friend connections for Facebook test users

var FbApp = require('./FbApp').FbApp;
var config = require('./config').config;

var fbapp = new FbApp(config);

// Total number of test users the app should have.
// If it has less than this more will be created.
// Keep in mind this includes the number of ignoredUsers.
var numUsers = 500;

fbapp.getUserList(function(testUsers) {
  // See if we need to create more users
  var usersNeeded = numUsers - testUsers.length;

  if (usersNeeded > 0) {
    console.log("Creating " + usersNeeded + " new users.");
    fbapp.createUsers(usersNeeded, function() {
      fbapp.makeFriends(fbapp.testUsers[0]);
    });
  } else {
    console.log("There are enough users (" + testUsers.length + "). Make friends!");
    fbapp.makeFriends(testUsers[0]);
  }
});
