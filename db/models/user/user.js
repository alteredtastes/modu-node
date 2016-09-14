var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, unique: true},
  password: String,
  orgId: String,
  role: String
});

module.exports = mongoose.model('User', userSchema);
