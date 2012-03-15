// Adds friend connections for Facebook test users

var url = require('url');
var FbApp = require('../fbtesting').FbTesting;
var config = require('../config').config;

var fbapp = new FbApp(config);

// ID of the user to find
var userId = "100003401572018";

// Check the batch of users for the target
// Repeat through all paginated results until end or user is found
var checkResult = function(users, data) {
  // users has all results, data has users from this batch
  var curUsers = data.data;

  for (var i = 0, len = curUsers.length; i < len; i++) {
    if (curUsers[i].id == userId) {
      console.log("Found user", curUsers[i]);
      console.log("done");
      return true;
    }
  }

  // User not found. Check next batch.
  if (data.paging && data.paging.next && data.data.length >= 50) {
    console.log("Not found, checking next page of users");
    var newPath = url.parse(data.paging.next).path;
    fbapp.getUserList(newPath, false, checkResult);
  } else {
    console.log("Search done, user not found.");
  }
};

// Fetch the user list and find a specific user.
// Good for finding the login URL
fbapp.getUserList(false, checkResult);
