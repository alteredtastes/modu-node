var rp = require('request-promise');
var needle = require('needle');
var auth = require('../../auth/auth.subroutes.js');
var accountModels = require('../../../db/models/user/accounts.index');
var User = accountModels.user;

function getApiResources(req, res, next) {
  needle.get(req.apiUrls[req.query.state], req.callOptions, function(err, response) {
    req.googleData = response.body;

    /*
    SAVE NECESSARY DATA TO DATABASE
    */

    /*ROUTE TESTING*/
    /*REDIRECT TO A ROUTE THAT FETCHES IT FROM THE DB OR FILE*/
    var payload = {};
    payload.id = '1029385710923857';
    payload.user = req.query.user || req.params.user || user || null;
    payload.note = 'this is a user who just saved resource data from google to the db';
    payload.createdIn = 'get.api.resources.js';
    payload.test_route = process.env.DEV_HOST + '/users/' + payload.user + '/resources?token=' + auth.jwtutility.createJWT({test: 'test'});
    var token = auth.jwtutility.createJWT(payload);

    /*BELOW ROUTE WOULD BE ACCESSIBLE TO THIRD-PARTIES AS REST API ROUTE*/
    res.redirect('/users/' + payload.user + '/resources?token=' + token);
  })
}

module.exports = getApiResources;
