var accountModels = require('../../db/models/user/accounts.index');
var User = accountModels.user;

function getUserDash(req, res, next) {
  res.json({
    file: 'get.user.dash.js',
    notes: 'user just logged in via google oauth and data was saved or updated on their account. User also might have entered site from / with a token in request header.',
    payload: req.decoded
  });
}

module.exports = getUserDash;
