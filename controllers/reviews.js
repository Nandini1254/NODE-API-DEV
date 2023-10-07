const { default: mongoose } = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Review = require("../models/Review");
const ErrorResponse = require("../utils/errorResponse");


/**
 * @description get all User
 * @access private
 * @route GET /api/v1/reviews
 * @route GET /api/v1/bootcamps/:bootcampId/reviews
 */
module.exports.getAllReview = asyncHandler(async (req, res) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootCamp: req.params.bootcampId })

    return res.status(200).json({
        success: true,
        count: reviews.length,
        reviews
    });
}
  res.status(200).json(res.advancedResults);
});


/**
 * @description create user by
 * @access Private
 * @route POST /api/v1/admin/user
 */
module.exports.createReview = asyncHandler(async (req, res) => {
  req.body.bootcamp = new mongoose.Types.ObjectId(req.params.bootcampId);
  req.body.user = new mongoose.Types.ObjectId(req.user.id);

  const review = await Review.create(req.body);
  res.json({ success: true, review });
});





