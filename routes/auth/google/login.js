var rp = require('request-promise');
var needle = require('needle');
var auth = require('../auth.subroutes');

function login(req, res, next) {
  needle.get(req.apiUrls[req.query.state], req.callOptions, function(err, response) {
    /*DATABASE*/
    req.googleData = response.body;

    /*IF GMAIL EXISTS ALREADY AS A LOCALLY CAPTURED EMAIL*/
      /*IN A SOCIAL_ACCOUNTS TABLE (SQL rows) OR DOCUMENT (keys in NOSQL),
        >>CHECK IF THE USER ALSO HAS GMAIL, GOOGLEID, REFRESH TOKEN, AND GOOGLE DISPLAY NAME
          >>SAVE THESE IF USER DOES NOT
        >>THEN CREATE JWT WITH THE EXISTING LOCAL USERID AND USERNAME*/
      /*THIS WILL ALLOW ADDING A USER'S GOOGLE DATA TO AN ACCOUNT REGISTERED LOCALLY WITH A GMAIL ADDRESS*/

    /*
    if(GOOGLE EMAIL EXISTS){
      DO THIS...
    }
    */

    /*IF GMAIL DOES NOT EXIST AS LOCALLY CAPTURED EMAIL
      /*CHECK IF GMAIL EXISTS IN SOCIAL_ACCOUNTS
        >>IF YES, UPDATE OR ADD GOOGLEID, REFRESH TOKEN, AND GOOGLE DISPLAY NAME
        >>CREATE JWT WITH LOCAL USERNAME AND EMAIL

        >>IF NO,
          >>SAVE THE GOOGLEID, REFRESH TOKEN, GMAIL, AND DISPLAY NAME INTO SOCIAL_ACCOUNTS
          >>SAVE GMAIL AS LOCAL EMAIL AND GMAIL SUBSTRING AS LOCAL USERNAME
          >>CREATE JWT WITH LOCAL USERNAME AND EMAIL*/
          var gmail = req.googleData.emails[0].value
          var user = gmail.substring(0, gmail.indexOf('@'));

    /*ROUTE TESTING*/
    var testJWT = auth.jwtutility.createJWT({createdIn: 'auth.google.login', reqPath: req.path});
    var payload = {};
    payload.id = '1029385710923857';
    payload.user = req.query.user || req.params.user || user || null;
    payload.note = 'this is a completely new user who logged in with google oauth';
    payload.createdIn = 'auth.google.login.js';
    payload.test_route = process.env.DEV_HOST + '/users/resource?user=' + payload.user + '&token=' + testJWT;
    var token = auth.jwtutility.createJWT(payload);

    res.redirect('/users/' + payload.user + '/dashboard?token=' + token);
  });
}

module.exports = login;
