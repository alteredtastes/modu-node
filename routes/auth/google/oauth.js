var rp = require('request-promise');
var needle = require('needle'); //using needle because request/request-promise is breaking
var auth = require('../auth.subroutes');

function state(val) {
  return function(req, res, next) {
    req.query.state = val;
    if(val === 'offline') {
      callback(req, res, next);
    } else {
      next();
    }
  }
}


/*_____________________________REDIRECT TO GOOGLE_______*/

function redirect(req, res, next) {
  /* OAUTH REUSE FOR BEST PRACTICE
Request different scopes at different routes when necessary for user experience best-practice.
Allow for reuse of the full redirect/callback flow because new scopes are requested FIRST in the redirect
using a code.
  */

  if(!req.query.state) {
    console.log('no state added via middleware! use the state query to renew the scope/token for new api calls');
  }

  var scopes = {
    oauth: 'scope=email%20profile',
    calendar: 'scope=https://www.googleapis.com/auth/calendar'
  }

  var payload = {};
  payload.state = req.query.state;
  payload.user = req.query.user || null;
  var state = req.query.state ? ('state=' + auth.jwtutility.createJWT(payload)) : '';

  var url = 'https://accounts.google.com/o/oauth2/v2/auth';
  var redirect_uri = 'redirect_uri=' + process.env['GOOGLE_' + req.query.state.toUpperCase() + '_REDIRECT'];
  // var redirect_uri = 'redirect_uri=' + process.env.GOOGLE_REDIRECT;
  var qstrings = [
    scopes[req.query.state],
    state,
    redirect_uri,
    'response_type=code',
    'access_type=online', //gets refresh token. comes only on first login.
    // 'approval_prompt=force', //force gets new refresh token on each login. limited usage!
    'client_id=' + process.env.GOOGLE_CLIENT_ID
  ];
  for (var i = 0; i < qstrings.length - 1; i++) {
    qstrings[i] += '&';
  }
  res.redirect(url + '?' + qstrings.join(''));
}


/*_____________________CALLBACK FROM GOOGLE_______________*/

function callback(req, res, next) {

  /*REQ.QUERY.CODE EXISTS IN THIS FUNCTION*/

  if(req.query.error) {res.json({error: req.query.error})}
  if(!req.query.state) {res.json({error: 'no state included!'})}

  /*INITIALIZE POST BODY FOR API CALL*/
  req.apiPost = {};
  req.apiPost.client_id = process.env.GOOGLE_CLIENT_ID;
  req.apiPost.client_secret = process.env.GOOGLE_CLIENT_SECRET;
  req.apiPost.include_granted_scopes = true;
  req.apiPost.json = true;
  req.callOptions = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }

  /*POST BODY CONFIG FOR USING REFRESH TOKEN*/
  if(req.query.state === 'offline') {
    /*GET REFRESH TOKEN FROM DATABASE*/
    req.apiPost.refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
    req.apiPost.grant_type = 'refresh_token';
  } else {
  /*POST BODY CONFIG FOR USING CODE*/
    req.apiPost.code = req.query.code; //CODE ATTACHED HERE TO GET TOKENS IN NEXT CALL
    req.apiPost.redirect_uri = process.env['GOOGLE_' + req.query.state.toUpperCase() + '_REDIRECT'];
    req.apiPost.grant_type = 'authorization_code';
  }

  /*THESE DATA ACCESS URLS ARE CHOSEN BY REQ.QUERY.STATE IN NEXT ROUTE FUNCTION*/
  req.apiUrls = {
    oauth: 'https://www.googleapis.com/plus/v1/people/me',
    calendar: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    drive: 'some api urls use an api key ' + process.env.GOOGLE_API_KEY
  }

  /*CODE OR REFRESH TOKEN GETS USED IN THIS CALL*/
  needle.post('https://www.googleapis.com/oauth2/v4/token', req.apiPost, req.callOptions, function(err, resp) {

    /*IF USER'S FIRST LOGIN*/
    if(req.query.refresh_token) {
      /*SAVE THE REFRESH TOKEN*/
    }

    req.callOptions.headers.Authorization = 'Bearer ' + resp.body.access_token;
    next();
  });
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
//   process.env.GOOGLE_REDIRECT
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
