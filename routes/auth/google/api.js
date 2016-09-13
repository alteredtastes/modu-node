var rp = require('request-promise');

function api(req, res, next, access_token, refresh_token) {
  rp('https://www.googleapis.com/plus/v1/people/me?access_token=' + access_token)
    .then(function(data) {
      var data = JSON.parse(data);
      res.json({
        email: data.emails[0].value,
        name: data

      })
    });
}

module.exports = api;
