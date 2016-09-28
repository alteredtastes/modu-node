var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  local: {
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    password: String,
    id: String,
    orgId: String,
    role: String
  },
  google : {
    id : String,
    token: String,
    email: String,
    displayName: String
  }
  // ,
  // facebook : {
  //   id : String,
  //   token: String,
  //   email: String,
  //   name: String
  // }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
