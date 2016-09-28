var rp = require('request-promise');
var needle = require('needle');
var auth = require('../auth.subroutes');
var User = require('../../../db/models/user/user');

function login(req, res, next) {
  needle.get(req.apiUrls[req.query.state], req.callOptions, function(err, resp) {
    var googleData = resp.body;
    console.log('google data ', googleData);
    /*DATABASE*/

/*SOCIAL ACCOUNT SCENARIOS
LINKING ACCOUNTS: Check if a user already exists in the database. If they do, then add a social account to their user profile
ACCOUNT CREATION: If a user does not exist in the database, then create a user profile
UNLINKING: Unlinking social accounts.
RECONNECTING: If a user unlinked a social account, but wants to reconnect it
*/

  /*IF USER IS CURRENTLY LOGGED IN, LINK THEIR GOOGLE ACCOUNT*/
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token) linkGoogle(token);

  /*IF USER DOES NOT EXIST IN DB, CREATE A PROFILE*/
  googleCreateProfile(googleData, token);

  /*IF USER WANTS TO UNLINK ACCOUNT --> HAPPENS IN UNLINK ROUTE*/

    var gmail = googleData.emails[0].value
    var user = gmail.substring(0, gmail.indexOf('@'));

    /*ROUTE TESTING*/
    var payload = {};
    payload.id = '1029385710923857';
    payload.user = req.query.user || req.params.user || user || null;
    payload.note = 'this is a completely new user who logged in with google oauth';
    payload.createdIn = 'auth.google.login.js';
    payload.test_route = process.env.HOST + '/users/resource?user=' + payload.user + '&token=' + auth.jwtutility.createJWT({test: 'test'});
    var token = auth.jwtutility.createJWT(payload);

    res.redirect('/users/' + payload.user + '/dashboard?token=' + token);
  });
}

function linkGoogle(token) {
  jwt.verify(token, process.env.APP_SECRET), function(err, decoded) {
    if(err) {
      console.log('TOKEN ERROR at auth.google.login');
      res.redirect('/auth/login');
    } else {
      id = decoded.id;
      User.findOne({ local.id : id }, function(err, user) {
        if(err) console.log(err);
        user.google.token = req.apiPost.refresh_token;
        user.google.id  = googleData.id;
        user.google.email = googleData.emails.value[0];
        user.google.displayName = googleData.displayName;
        user.save(function(err) {
          if (err) console.log(err);
          res.redirect('/');
        });
      });
    }
  }
}

function googleCreateProfile(googleData, token) {
  var newUser = new User();
  newUser.google.id = googleData.id;
  newUser.google.token = token;
  newUser.google.email = googleData.emails.value[0];
  newUser.google.displayName = googleData.displayName;
  res.redirect('/');
}

module.exports = login;
