var rp = require('request-promise');
require('dotenv').load();
var auth = require('../auth.subroutes');

function api(req, res, next, access_token, refresh_token) {
  var options = {
    method: 'POST',
    uri: 'https://www.googleapis.com/oauth2/v4/toerrken',
    body: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    },
    json: true
  }
  rp(options)
  .then(function(data) {
    res.json({
      data
    })
  })
  // rp('https://www.googleapis.com/plus/v1/people/me?access_token=' + access_token)
    // .then(function(data) {
    //   var data = JSON.parse(data);
    //   var email = data.emails[0].value;
    //   var name = data.displayName;
    //
    //   /*TO DB:*/
    //   /*INSERT GOOGLE ID*/
    //   /*INSERT GOOGLE REFRESH TOKEN*/
    //   /*INSERT GOOGLE EMAIL*/
    //   /*INSERT GOOGLE DISPLAY NAME*/
    //
    //   /*VERIFY TOKEN PAYLOAD DATA BELOW IN THE JWT VERIFY MIDDLEWARE*/
    //
    //   var payload = { name, email };
    //   var token = auth.jwtutility.createJWT(payload, process.env.APP_SECRET);
    //   res.json({
    //     email, name, token, data
    //   });
    // })
    .catch(function(err) {
      res.json({
        message: err
      });
    });
}

module.exports = api;
