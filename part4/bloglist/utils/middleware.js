const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('./config')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  request.token =
    authorization && authorization.startsWith('Bearer ')
      ? authorization.replace('Bearer ', '')
      : null

  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, config.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  request.user = await User.findById(decodedToken.id)

  next()
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

module.exports = {
  tokenExtractor,
  userExtractor,
  errorHandler,
}
