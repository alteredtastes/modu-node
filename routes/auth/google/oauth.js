require('dotenv').load();
var rp = require('request-promise');
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
      res.redirect('/');
    }
    oauth2Client.setCredentials(tokens);
    var access_token = tokens.access_token;
    var refresh_token = tokens.refresh_token;
    api(req, res, next, access_token, refresh_token);
  });
}

// function refresh(userId) {
//   /*
//   USERID PARAM EXTRACTED FROM JWT VERIFY. QUERY DB WITH USERID TO FIND IF GOOGLE ALREADY LINKED. IF LINKED, GET REFRESH TOKEN FROM DB TO RUN THIS FUNCTION. OTHERWISE, REDIRECT TO FIRST OAUTH LOGIN ROUTE.
//   */
//
//   /*
//   FOR THIS FUNCTION, A USER HAS ALREADY RUN THE GOOGLE OAUTH AND VERY LIMITED PROFIlE DATA HAS BEEN SAVED, MOST IMPORTANTLY, THEIR REFRESH TOKEN, GOOGLE ID, EMAIL, AND DISPLAY NAME. AT A NEW POINT DURING THE APP INTERACTION FLOW, THE APP ASKS THE USER IF THEY WOULD LIKE TO ENABLE A CERTAIN APP FUNCTIONALITY. THIS ENABLING COULD THEN REQUEST CERTAIN RESOURCES FROM THEIR GOOGLE ACCOUNT, BUT THIS TIME WOULD NEED A REFRESH TOKEN, PULLED FROM THE DATABASE, TO RUN A NEW GOOGLE API CALL.
//   */
//
//   /*
//   EXAMPLE HEADER
//   POST /oauth2/v4/token HTTP/1.1
//   Host: www.googleapis.com
//   Content-Type: application/x-www-form-urlencoded
//   */
//
//   /*QUERY FOR USER'S REFRESH TOKEN HERE, THEN RUN THIS RP CALL*/
//
//   rp('https://www.googleapis.com/oauth2/v4/token', {
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     refresh_token=/*REFRESH TOKEN GOES HERE*/
//     grant_type=refresh_token
//   })
//   .then(function(refreshedAuth) {
//     return refreshedAuth;
//   })
// }

module.exports = {
  redirect,
  callback,
  // refresh
}
