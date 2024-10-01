const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
})

UserSchema.pre('save', async function () {
  // This ensures that passwords are hashed before being stored in the database, 
  // so sensitive information is not saved as plain text.
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})


UserSchema.methods.createJWT = function () {
  return jwt.sign(
    //  The payload of the token contains the user’s ID (_id) and their name. 
    // This information is embedded in the token and can be extracted when the token is decoded later.
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    // The secret key (stored in environment variables) is used to sign the token and ensure that the token cannot
    //  be tampered with. Only someone with the secret key can verify or decode the token.
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
  // bcrypt.compare() is used to compare the provided plain text password (canditatePassword) with the hashed 
  // password stored in the database (this.password).bcrypt takes care of hashing the plain text password 
  // using the same salt and then compares it with the stored hash.The function returns true if the passwords match, and false otherwise.
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
