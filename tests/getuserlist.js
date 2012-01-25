// Adds friend connections for Facebook test users

var FbApp = require('../FbApp').FbApp;
var config = require('../config').config;

var fbapp = new FbApp(config);

console.log("Testing non-recursive getUserList");
fbapp.getUserList(false, function(testUsers) {
  console.log("List of test users", testUsers);
  recursive();
});

function recursive() {
  console.log("Testing recursive getUserList");
  fbapp.getUserList(function(testUsers) {
    console.log("List of test users", testUsers);
  });
};
