const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { sendMail } = require("../utils/sendMail");
const crypto = require('crypto');
/**
 * @description Register a User
 * @route POST /api/v1/auth/register
 * @access PUBLIC
 */
exports.register = asyncHandler(async function (req, res, next) {
    const { name, email, password, role } = req.body;

    const user = await User.create({ name, email, password, role })

    sendTokenWithCookie(user, 200, res);
});

/**
 * @description Login a User
 * @route POST /api/v1/auth/login
 * @access PUBLIC
 */
exports.login = asyncHandler(async function (req, res, next) {
    const { email, password } = req.body;

    //validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please Enter Email or Password', 401))
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401))
    }

    //CHECK PASSOWRD
    const match = await user.matchPassword(password);

    if (!match) {
        return next(new ErrorResponse('Please Enter valid Password', 401));
    }

    sendTokenWithCookie(user, 200, res);
});


/**
 * @description get a current logged in user
 * @route GET /api/v1/auth/me
 * @access PRIVATE
 */
exports.loggedInUser = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401))
    }

    res.status(200).json({
        success: true,
        user
    })

});

/**
 * @testDescription mailtrap account used for testing
 * @description Forgot password
 * @route POST /api/v1/auth/forgotpassword
 * @access Public
 */
exports.forgotPassword = asyncHandler(async function (req, res, next) {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401))
    }
    const resetPasswordToken = await user.generateResetPasswordToken();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetPasswordToken}`

    try {
        await sendMail({
            from: process.env.FROM_EMAIL,
            to: req.body.email,
            subject: "Forgot Password",
            html: resetUrl
        })
        await user.save({ validateBeforeSave: false })

        res.status(200).json({
            success: true,
            message: "Reset password set to your registered Mail"
        });
    } catch (err) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save({ validateBeforeSave: false })
        return next(err);
    }
});

/**
 * @description Reset Password 
 * @access public
 * @route PUT /api/v1/auth/resetpassword/:token
 */
module.exports.resetPassword = asyncHandler(async function (req, res, next) {
    if (!req.params.token) {
        return next(new ErrorResponse('Token is missing', 400))
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return next(new ErrorResponse('Token is missing', 400))
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Password modified successfully'
    })
});

/**
 * @description Update user details
 * @route PUT /api/v1/auth/update
 * @access private
 */
module.exports.updateUser = asyncHandler(async function (req, res, next) {

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ErrorResponse('Please add data to update', 401))
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        success: true,
        user
    })
});

/**
 * @description Update user password
 * @route PUT /api/v1/auth/updatePassword
 * @access private
 */
module.exports.updatePassword = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id).select('+password');

    // Check old password
    if (!(await user.matchPassword(req.body.oldPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }
    user.password = req.body.newPassword;

    await user.save();

    sendTokenWithCookie(user, 200, res);
});

const sendTokenWithCookie = async function (user, status, res) {
    //CREATE TOKEN
    const token = await user.getSignedJWTToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(status).cookie('token', token, options).json({
        success: true,
        token
    });
};

/**
 * @description user logout
 * @route POST /api/v1/auth/logout
 */
exports.userLogout = asyncHandler(async function(req, res, next){

    res.cookie('token', undefined, {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "User logout"
    })
});

