require('dotenv').load();
var jwt = require('jsonwebtoken');

function createJWT(payload) {
  // delete user.password;
  return jwt.sign(payload, process.env.APP_SECRET, {
    expiresIn: '10m'
  });
}

function verifyJWT() {
  return function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.query.state;
    if(!token) {
      /*
      SPA OPTION:
      res.json({error: 'no token!'});
      RENDER OPTION:*/
      res.render('index.njk');
    }
    if (token) {
      jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
        if (err) {
          /*
          SPA OPTION:
          res.json({ success: false, message: 'Failed to authenticate token.' });
          RENDER OPTIONS:
          res.render('index.njk');*/
          res.redirect('/auth/login');/* OR res.render('login.njk')*/
        } else if (decoded.state) {
          return decoded.state;
        } else {
          req.decoded = decoded;
          if(req.path === '/') {
            res.redirect('/users/' + req.decoded.username + '/dashboard?token=' + token);
          } else {
            next(); //FORWARDS TO OAUTH LOGIN CALLBACKS AND/OR DASHBOARD.
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
  createJWT,
  verifyJWT
}
