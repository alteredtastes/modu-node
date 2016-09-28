require('dotenv').load();
var jwt = require('jsonwebtoken');

/*________________PROTECT AGAINST CSRF, USED IN API CALLS*/
function encryptState(payload) {
  return jwt.sign(payload, process.env.APP_STATE_SECRET, {
    expiresIn: '10m'
  });
}

function decryptState() {
  return function(req, res, next) {
    var state = req.query.state;
    if(state) {
      jwt.verify(state, process.env.APP_STATE_SECRET, function(err, decoded) {
        if(err) {
          console.log('STATE TOKEN ERROR!');
          res.redirect('/auth/login');
        } else {
          req.query.state = decoded.state;
          req.query.user = decoded.user;
          req.decoded = decoded;
          next();
        }
      })
    }
  }
}

/*__________________PROTECT LOCAL RESOURCES*/
function createJWT(payload) {
  // delete user.password;
  return jwt.sign(payload, process.env.APP_SECRET, {
    expiresIn: '10m'
  });
}

function verifyJWT() {
  return function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(!token) {
      console.log('NO TOKEN!');
      res.render('index.njk');
    }
    if (token) {
      jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
        if (err) {
          console.log('TOKEN ERROR!');
          res.redirect('/auth/login');/* OR res.render('login.njk')*/
        } else {
          req.decoded = decoded;
          if(req.path === '/') {
            res.redirect('/users/' + req.decoded.user + '/dashboard?token=' + token);
          } else {
            next(); /*FORWARDS TO OAUTH LOGIN CALLBACKS AND/OR DASHBOARD.*/
          }
        }
      });
    } /*else {
      res.status(403).send({
          success: false,
          message: 'No token provided.'
      });
    }*/
  }
}

module.exports = {
  encryptState,
  decryptState,
  createJWT,
  verifyJWT
}
