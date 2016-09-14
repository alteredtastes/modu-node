var rp = require('request-promise');
require('dotenv').load();
var auth = require('../auth.subroutes');

function api(req, res, next, access_token, refresh_token) {
  rp('https://www.googleapis.com/plus/v1/people/me?access_token=' + access_token)
    .then(function(data) {
      var data = JSON.parse(data);
      var email = data.emails[0].value;
      var name = data.displayName;

      /*TO DB:*/
      /*INSERT GOOGLE ID*/
      /*INSERT GOOGLE REFRESH TOKEN*/
      /*INSERT GOOGLE EMAIL*/
      /*INSERT GOOGLE DISPLAY NAME*/

      /*VERIFY TOKEN PAYLOAD DATA BELOW IN THE JWT VERIFY MIDDLEWARE*/

      var payload = { name, email };
      var token = auth.jwtutility.createJWT(payload, process.env.APP_SECRET);
      res.json({
        email, name, token, data
      });
    })
    .catch(function(err) {
      res.json({
        message: err
      });
    });
}

module.exports = api;
