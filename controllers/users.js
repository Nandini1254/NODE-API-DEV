const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");


/**
 * @description get all User
 * @access private
 * @route GET /api/v1/admin/user
 */
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @description get User by id
 * @access public
 * @route GET /api/v1/admin/user/:id
 */
module.exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id })
  res.json({ user: user, success: true });
});

/**
 * @description create user by
 * @access Private
 * @route POST /api/v1/admin/user
 */
module.exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.json({ success: true, user });
});

/**
 * @description update User by  
 * @access Private
 * @route PUT /api/v1/admin/user/:id
 */
module.exports.updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`user not found with id of ${req.params.id}`, 404)
    );
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    upsert: false
  });

  res.status(200).json({ success: true, data: user });

});

/**
 * @description delete User by
 * @access
 * @route DELETE /api/v1/admin/user/:id
 */
module.exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });

});


