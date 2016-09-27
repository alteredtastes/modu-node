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
          var username = gmail.substring(0, gmail.indexOf('@'));

    var payload = {
      id: '1029385710923857',
      username: username,
      note: 'this is a completely new user who logged in with google oauth',
      test_route: 'http://localhost:3000/users/calendar?user=' + username
    }
    //possible to redirect with token, but not as query or param??
    var token = auth.jwtutility.createJWT(payload)
    res.redirect('/users/' + username + '/dashboard?token=' + token);
  });
}

module.exports = login;
