function getResources(req, res, next) {
  console.log('made it inside getResources');
  res.json({
    headers: req.headers,
    message: 'this is getResources',
    payload: req.decoded
  });
}

module.exports = getResources;
