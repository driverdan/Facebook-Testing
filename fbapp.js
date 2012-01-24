var https = require('https');
var url = require('url');

function FbApp(config) {
  if (!config) {
    throw new Exception("Configuration required");
  }

  this.graphPrefix = config.graphPrefix;
  this.appId = config.appId;
  this.appSecret = config.appSecret;

  // Access token can be fetched later
  this.appAccessToken = config.appAccessToken || null;
  // List of all test users accessible to the app
  this.testUsers = config.testUsers || [];
  // Users to ignore from the list of test users
  this.ignoredUsers = config.ignoredUsers || [];

  // Facebook's open graph hostname
  this.graphHost = 'graph.facebook.com';
};

FbApp.prototype = {
  getAccessToken: function(callback) {
    var _this = this;
    this.appAccessToken = "";
    console.log("Getting access token");

    var options = {
      host: this.graphHost,
      path: '/oauth/access_token?client_id=' + this.appId + '&client_secret=' + this.appSecret + '&grant_type=client_credentials'
    };

    https.get(options, function(res) {
      res.on('data', function(data) {
        _this.appAccessToken += data;
      });

      res.on('end', function() {
        console.log("Access token: " + _this.appAccessToken);

        if (callback) {
          callback();
        }
      });

      res.on('close', function(err) {
        console.log("Error", err);
      });
    })
    .on('error', function(e) {
      console.log('Problem with request: ' + e.message);
    });
  },

  getUserList: function(path, callback) {
    var _this = this;
    console.log("Fetching list of users");

    var options = {
      host: this.graphHost,
      path: path ? path : '/' + this.appId + '/accounts/test-users?' + this.appAccessToken
    };

    https.get(options, function(res) {
      var result = "";

      res.on('data', function(data) {
        result += data;
      });

      res.on('end', function() {
        var data = JSON.parse(result);

        if (data.error || !data.data) {
          console.log("Error fetching users", data);
        } else {
          // Add new users
          if (data.data.length) {
            _this.testUsers = _this.testUsers.concat(data.data);
          }

          // Only 50 users at a time, handle more pages
          // Sometimes it gives next page when there isn't actually one
          if (data.paging && data.paging.next && data.data.length >= 50) {
            console.log("Found another page of users");
            var newPath = url.parse(data.paging.next).path;
            _this.getUserList.apply(_this, newPath);
          } else {
            if (callback) {
              callback(_this.testUsers);
            }
          }
        }
      });

      res.on('close', function(err) {
        console.log("Error completing request", err);
      });
    })
    .on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
  },

  // Recursive function to create many users
  // Executes callback when done
  createUsers: function(num, callback) {
    var _this = this;
    num = num || 1;

    var options = {
      host: this.graphHost,
      path: '/' + this.appId + '/accounts/test-users?installed=true&' + this.appAccessToken,
      method: 'POST'
    };

    num--;

    var result = "";

    https.request(options, function(res) {
      res.on('data', function(data) {
        result += data;
      });

      res.on('end', function() {
        var data = JSON.parse(result);

        if (data.error || !data.id) {
          console.log("Error creating user", data);
        } else {
          console.log("Created new user " + data.id);
          _this.testUsers.push(data);

          if (num === 0 && callback) {
            callback();
          }
        }
      });

      res.on('close', function(err) {
        console.log("Error", err);
      });
    })
    .on('error', function(e) {
      console.log('Problem with request: ' + e.message);
    })
    .end();

    if (num > 0) {
      _this.createUsers.apply(this, [num, callback]);
    }
  },

  deleteUser: function(userId, callback) {
    console.log("Attempting to delete user " + userId);

    var options = {
      host: this.graphHost,
      path: '/' + userId + '/?method=delete&' + this.appAccessToken,
      method: 'POST'
    };

    var result = "";

    https.request(options, function(res) {
      res.on('data', function(data) {
        result += data;
      });

      res.on('end', function() {
        var success = result === "true";

        if (success) {
          console.log("Deleted user " + userId);
        } else if (result === "false") {
          console.log("Didn't delete user " + userId);
        } else {
          console.log("Unexpected result", result);
        }

        if (callback) {
          callback(success);
        }
      });

      res.on('close', function(err) {
        console.log("Error", err);
      });
    })
    .on('error', function(e) {
      console.log('Problem with request: ' + e.message);
    })
    .end();
  },

  // Makes the user authorized to use the app
  addToApp: function(user) {
    var options = {
      host: this.graphHost,
      path: '/' + this.appId + '/accounts/test-users?installed=true&permissions=read_stream&' + this.appAccessToken + "&owner_" + this.appAccessToken + "&uid=" + user.id,
      method: 'POST'
    };

    var result = "";

    https.request(options, function(res) {
      res.on('data', function(data) {
        result += data;
      });

      res.on('end', function() {
        console.log("addToApp done", result);
      });

      res.on('close', function(err) {
        console.log("Error", err);
      });
    })
    .on('error', function(e) {
      console.log('Problem with request: ' + e.message);
    })
    .end();
  },

  // Takes the first user and adds the remaining users as its friend
  makeFriends: function(user, rawFriends) {
    // Default to all test users
    rawFriends = rawFriends || this.testUsers;

    // Remove ignoredUsers
    var friends = rawFriends.filter(function(contact) {
      return ignoredUsers.indexOf(contact.id) === -1;
    });

    // Default first user will be friends with the rest
    user = user || friends.shift();

    console.log("Adding " + friends.length + " new friends to user ID " + user.id);

    friends.forEach(function(friend) {
      if (friend.id == user.id) {
        console.log("Skipping user, can't friend self");
      } else if (friend.access_token) {
        this.addFriend(user, friend, function(success) {
          success && this.addFriend(friend, user);
        });
      } else {
        console.log("User " + friend.id + " isn't authorised for this app.");
        this.addToApp(friend);
      }
    });
  },

  addFriend: function(user, friend, callback) {
    var options = {
      host: this.graphHost,
      path: '/' + user.id + '/friends/' + friend.id + '?access_token=' + user.access_token,
      method: 'POST'
    };

    var result = "";

    https.request(options, function(res) {
      res.on('data', function(data) {
        result += data;
      });

      res.on('end', function() {
        var success = result === "true";

        if (success) {
          console.log("Added friend " + friend.id + " to " + user.id);
        } else if (result === "false") {
          console.log("Didn't add friend " + friend.id);
        } else {
          console.log("Unexpected result from adding " + friend.id + " to " + user.id, result);
        }
        if (callback) {
          callback(success);
        }
      });

      res.on('close', function(err) {
        console.log("Error", err);
      });
    })
    .on('error', function(e) {
      console.log('Problem with request: ' + e.message);
    })
    .end();
  }
};

exports.FbApp = FbApp;
