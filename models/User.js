// const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
// const randomize = require('randomatic');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password using bycrptjs
UserSchema.pre("save", async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

//create JWT token by login
UserSchema.methods.getSignedJWTToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
}

//match password of user
UserSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
}

//genarate reset password token
UserSchema.methods.generateResetPasswordToken = async function () {
  const cryptoToken = crypto.randomBytes(10).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(cryptoToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return cryptoToken;
}

module.exports = mongoose.model('User', UserSchema);




























































































