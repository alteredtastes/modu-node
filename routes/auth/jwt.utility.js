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
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
        if (err) {
          console.log(err);
          res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          req.decoded = decoded;
          if(req.path === '/') {
            res.redirect('/users/' + req.decoded.username + '/dashboard?token=' + token);
          } else {
            next();
          }
        }
      });
    } else if (!token && req.path === '/') {
      res.render('index.njk');
    } else {
      res.status(403).send({
          success: false,
          message: 'No token provided.'
      });
    }
  }
}

module.exports = {
  createJWT,
  verifyJWT
}
