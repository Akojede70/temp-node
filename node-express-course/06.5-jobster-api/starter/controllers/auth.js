const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  // This line looks for a user in the database by their email using User.findOne().
// If the user is not found, it throws an UnauthenticatedError (which results in a 401 Unauthorized status) 
// with the message "Invalid Credentials".
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  // The method user.comparePassword(password) (which was defined earlier in the User model) 
  // compares the submitted plain text password with the hashed password stored in the database.
// If the password is incorrect, it throws an UnauthenticatedError with the message "Invalid Credentials".
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {
  register,
  login,
}
