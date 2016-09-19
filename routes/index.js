var express = require('express');
var router = express.Router();
var api = require('./api/api.subroutes');
var auth = require('./auth/auth.subroutes');
var org = require('./org/org.subroutes.js');
var user = require('./user/user.subroutes');

router.get('/', (req, res) => {res.render('index.njk');});

/*API*/
router.get('/api', /*auth.jwt.verifyJWT(), */api.getSomething);

/*AUTH*/
  /*local*/
router.get('/auth/login', (req, res) => {res.render('login.njk');});
router.post('/auth/login', auth.local.login);
router.get('/auth/register', (req, res) => {res.render('register.njk');});
router.post('/auth/register', auth.local.register);

  /*oauth*/
router.get('/auth/facebook', auth.facebook.redirect);
router.get('/auth/facebook/callback', auth.facebook.callback);
router.get('/auth/github', auth.github.redirect);
router.get('/auth/github/callback', auth.github.callback);
router.get('/auth/google', auth.google.oauth.state('oauth'), auth.google.oauth.redirect);
router.get('/auth/google/callback', auth.google.oauth.callback);

router.get('/calendar', auth.google.oauth.state('calendar'), auth.google.oauth.redirect);
router.get('/calendar/callback', auth.google.oauth.callback, function(req, res, next) {
  console.log('this is the state'/*, req.api[req.query.state]*/);
})

/*ORG*/
  /*moma*/
    /*artist*/
router.get('/org/moma/artists', /*auth.jwtutility.verifyJWT(), */org.moma.artist.findArtists);
router.get('/org/moma/artist/:id', /*auth.jwtutility.verifyJWT(), */org.moma.artist.findArtistById);
router.post('/org/moma/artists', /*auth.jwtutility.verifyJWT(), */org.moma.artist.insertArtist);
router.put('/org/moma/artist/:id', /*auth.jwtutility.verifyJWT(), */org.moma.artist.updateArtist);
router.delete('/org/moma/artists/:id', /*auth.jwtutility.verifyJWT(), */org.moma.artist.deleteArtist);

    /*API TESTING*/
router.get('/org/moma/artist/google/selections', auth.jwtutility.verifyJWT(), org.moma.artist.selections);

    /*work*/
router.get('/org/moma/works', /*auth.jwtutility.verifyJWT(), */org.moma.work.findWorks);
router.get('/org/moma/work/:id', /*auth.jwtutility.verifyJWT(), */org.moma.work.findWorkById);
router.post('/org/moma/works', /*auth.jwtutility.verifyJWT(), */org.moma.work.insertWork);
router.put('/org/moma/work/:id', /*auth.jwtutility.verifyJWT(), */org.moma.work.updateWork);
router.delete('/org/moma/works/:id', /*auth.jwtutility.verifyJWT(), */org.moma.work.deleteWork);

/*USER*/
router.get('/users/:user/dashboard', /*auth.jwtutility.verifyJWT(), */user.getUserDash);
router.get('/users', /*auth.jwtutility.verifyJWT(), */user.findUsers);

module.exports = router;
