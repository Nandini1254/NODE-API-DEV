const express = require("express");
const { protect } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const Review = require("../models/Review");
const { getAllReview, createReview } = require("../controllers/reviews");
const router = express.Router({mergeParams: true});

router.route("/").get(advancedResults(Review, { path: 'bootcamp', select:'name description'}), getAllReview).post(protect, createReview);

module.exports = router;
