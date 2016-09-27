var rp = require('request-promise');
var needle = require('needle');
var accountModels = require('../../../db/models/user/accounts.index');
var User = accountModels.user;

function getApiCalendars(req, res, next) {
  needle.get(req.apiUrls[req.query.state], req.callOptions, function(err, response) {
    req.googleData = response.body;
    console.log('this is the data ', response.body);


    /*
    SAVE DATA TO DB FROM API CALL HERE
    */


    /*
    THEN REDIRECT TO ROUTE THAT FETCHES IT
    FROM THE DB FOR A LOCAL API RESPONSE
    */
    var payload = {
      id: '1029385710923857',
      username: username,
      note: 'this is a user who just saved calendar data from google to the db',
      test_route: 'this needs to be filled in with a new user test route'
    }
    var token = auth.jwtutility.createJWT(payload)
    res.redirect('/users/' + username + '/calendars?token=' + token);
  })
}

module.exports = getApiCalendars;
