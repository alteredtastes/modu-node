require('dotenv').load();
var api = require('./api.js');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

var scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/plus.me'
];

function redirect(req, res, next) {
  res.redirect(oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
  }));
}

function callback(req, res, next) {
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    if(err) {
      res.json(err);
    }
    oauth2Client.setCredentials(tokens);
    var access_token = tokens.access_token;
    var refresh_token = tokens.refresh_token;
    api(req, res, next, access_token, refresh_token);
  });
}

module.exports = {
  redirect,
  callback
}
