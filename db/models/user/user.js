var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  local: {
    email: {type: String, unique: true},
    password: String,
    id: String,
    orgId: String,
    role: String
  },
  google : {
    id : String,
    token: String,
    email: String,
    name: String
  }
  // ,
  // facebook : {
  //   id : String,
  //   token: String,
  //   email: String,
  //   name: String
  // }
});

module.exports = mongoose.model('User', userSchema);
