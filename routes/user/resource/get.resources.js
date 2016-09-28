function getResources(req, res, next) {
  console.log('made it inside getResources');
  res.json({
    file: 'get.resources.js',
    notes: 'user just allowed access to a google resource and necessary data was saved to db. this url retrieved it from the database for viewing.',
    payload: req.decoded
  });
}

module.exports = getResources;
