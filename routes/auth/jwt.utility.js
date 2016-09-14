require('dotenv').load();
var jwt = require('jsonwebtoken');

function createJWT(payload) {
  // delete user.password;
  return jwt.sign(payload, process.env.APP_SECRET, {
    expiresIn: 60
  });
}

function verifyJWT() {
  return function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          req.decoded = decoded;
          console.log('this is the REQ', decoded);
          next();
        }
      });
    } else {
      return res.status(403).send({
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
