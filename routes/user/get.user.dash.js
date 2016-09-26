var accountModels = require('../../db/models/user/accounts.index');
var User = accountModels.user;

function getUserDash(req, res, next) {
  res.json({
    message: 'this is getUserDash',
    payload: req.decoded
  });
}

module.exports = getUserDash;
