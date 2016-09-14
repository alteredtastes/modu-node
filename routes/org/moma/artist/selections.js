function selections(req, res, next) {
  res.json({
    message: req.query.token
  })
}

module.exports = selections;
