const jwt = require('jsonwebtoken');
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');


exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.Authorization && req.headers.Authorization.startsWith("Bearer")) {
        token = req.headers.Authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorResponse("Not authorise for this route", 401));
    }

    //verify token
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken.id);
        if (!user) {
            throw Error("User is not registered");
        }
        req.user= user;
        next();
    } catch (err) {
        return next(new ErrorResponse(err.message, 401));
    }
})


exports.authorise = (...roles) => (req, res, next) =>{
    if(!roles.includes(req.user.role)){
        return next(new ErrorResponse(`Not authorise for ${req.user.role} route`, 403));
    }
    next();
}