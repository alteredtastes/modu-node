var rp = require('request-promise');
var needle = require('needle'); //using needle because request/request-promise is breaking
var api = require('./api.js');

function redirect(req, res, next) {
  /*FILTER OUT SCOPES BY STATE HERE*/
  var scope;
  if(!req.state) { console.log('no state added via middleware for redirect!');}
  if(req.state === 'oauth') scope = 'scope=email%20profile'
  if(req.state === 'calendar') scope = 'scope=https://www.googleapis.com/auth/calendar.readonly'
  var url = 'https://accounts.google.com/o/oauth2/v2/auth';
  var state = req.state ? ('state=' + req.state) : '';
  var redirect_uri = 'redirect_uri=' + process.env['GOOGLE_' + req.state.toUpperCase() + '_REDIRECT'];
  var qstrings = [
    scope,
    state,
    redirect_uri,
    'response_type=code',
    /*'approval_prompt=force',*/
    'client_id=' + process.env.GOOGLE_CLIENT_ID
  ];
  for (var i = 0; i < qstrings.length - 1; i++) {
    qstrings[i] += '&';
  }
  res.redirect(url + '?' + qstrings.join(''));
}

function callback(req, res, next) {
  if(req.query.error) {
    res.json({
      error: req.query.error
    });
  }
  var options = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
  var body = {
    code: req.query.code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env['GOOGLE_' + req.query.state + '_REDIRECT'],
    grant_type: 'authorization_code',
    // include_granted_scopes: true,
    json: true
  }
  needle.post('https://www.googleapis.com/oauth2/v4/token', body, options, function(err, resp) {
    /*OAUTH ROUTE GETS RES, API CALLS GET NEXT*/
    if(req.query.state === 'oauth') {
      needle.get('https://www.googleapis.com/plus/v1/people/me?access_token=' + resp.body.access_token, function (err, resp) {
        res.json({
          body: resp.body
        });
      });
    }

    if(req.query.state === 'calendar') {
      needle.get('https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=' + resp.body.access_token, function (err, resp) {
        req.body = resp.body;
        next();
      });
    }

    if(req.query.state === 'somethingelse') {
      needle.get('someotherurl?access_token=' + resp.body.access_token, function (err, resp) {
        req.body = resp.body;
        next();
      });
    }
  });
}

function state(val) {
  return function(req, res, next) {
    req.state = val;
    next();
  }
}

module.exports = {
  redirect,
  callback,
  state
}

// function refresh(req, res, next) {
//
//   .then(function(name) {
//     console.log('NAME = ', name);
//     console.log('REFRESH = ', refresh_token);
//     var options = {
//       method: 'POST',
//       uri: 'https://www.googleapis.com/oauth2/v4/token',
//       headers: {
//         'content-type': 'application/x-www-form-urlencoded'
//       },
//       body: {
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         refresh_token: refresh_token,
//         grant_type: 'refresh_token',
//         scope: 'https://www.googleapis.com/auth/calendar'
//       },
//       json: true
//     }
//     rp(options)
//     .then(function(newData) {
//       console.log(newData);
//       res.json({
//         newData
//       })
//     })
//   })
// }


/*USING REQUEST PROMISE (currently broken)*/
// function callback(req, res, next) {
//   if(req.query.error) {
//     res.json({
//       error: req.query.error
//     })
//   }
//   var accTokenOptions = {
//     method: 'POST',
//     uri: 'https://www.googleapis.com/oauth2/v4/token',
//     headers: {
//       'content-type': 'application/x-www-form-urlencoded'
//     },
//     body: {
//       code: req.query.code,
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uri: process.env.GOOGLE_REFRESH_URL,
//       grant_type: 'authorization_code'
//     },
//     json: true,
//   }
//   rp(accTokenOptions).then(function(data) {
//     res.json({
//       data: data
//     })
//   });
// }


/*USING THE NODEJS GOOGLE API CLIENT*/
// var google = require('googleapis');
// var OAuth2 = google.auth.OAuth2;
//
// var oauth2Client = new OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_OAUTH_REDIRECT
// );

// var scopes = [
//   'https://www.googleapis.com/auth/userinfo.email',
//   'https://www.googleapis.com/auth/userinfo.profile',
//   // 'https://www.googleapis.com/auth/calendar',
//   'https://www.googleapis.com/auth/plus.me'
// ];
// function redirect(req, res, next) {
//   res.redirect(oauth2Client.generateAuthUrl({
//     access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
//     approval_prompt: 'force', //ONLY NEEDED FOR TESTING. Required to get refresh_token on every call, without this, refresh_token comes only in the first call.
//     scope: scopes
//   }));
// }

// function callback(req, res, next) {
//   oauth2Client.getToken(req.query.code, function(err, tokens) {
//     if(err) {
//       res.redirect('/');
//     }
//     oauth2Client.setCredentials(tokens);
//     var access_token = tokens.access_token;
//     var refresh_token = tokens.refresh_token;
//     console.log('made it to the callback');
//     // api(req, res, next, access_token, refresh_token);
//   });
// }


// function refresh(userId) {
//   /*
//   USERID EXTRACTED FROM JWT VERIFY IN ROUTE THEN PASSED TO THIS FUNCTION FOR NEW API CALL. QUERY DB WITH USERID TO FIND IF GOOGLE ALREADY LINKED. IF LINKED, GET REFRESH TOKEN FROM DB TO RUN THIS FUNCTION. OTHERWISE, REDIRECT TO FIRST OAUTH LOGIN ROUTE.
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
//   var options = {
//     method: 'POST',
//     uri: 'https://www.googleapis.com/oauth2/v4/token',
//     body: {
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       refresh_token: /*REFRESH TOKEN GOES HERE*/
//       grant_type: refresh_token
//     },
//     json: true
//   };
//
//   rp(options)
//   .then(function(refreshedAuth) {
//     return refreshedAuth;
//   })
//   .catch(function(err) {
//     console.log(err);
//   })wqqewv
// }
