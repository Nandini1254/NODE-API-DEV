const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {

  //here can modify err message and status code by errorResponse code
  var error = {};
  if (err.name === 'MongoServerError' && err.code === 11000) {
    error = new ErrorResponse(err.message, 400)
  }

  console.log(err)
  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    error: error.message || err.message || 'Server Error'
  })
}

module.exports = errorHandler;