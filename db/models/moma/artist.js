var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var artistSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Artist', artistSchema);
