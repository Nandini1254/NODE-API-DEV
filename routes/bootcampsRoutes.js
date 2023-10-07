const express = require("express");
const {
  getAllBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithInRadius,
  uploadBootcampFile
} = require("../controllers/bootcamps");
const router = express.Router({mergeParams: true});
const coursesRoutes = require('./coursesRoutes');
const reviewRoutes = require('./reviewRoutes');
const upload = require("../middleware/fileUpload");
const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/Bootcamp");
const { protect, authorise } = require("../middleware/auth");

router.route("/").get(advancedResults(Bootcamp, 'courses'), getAllBootcamps).post(protect, authorise('admin', 'publisher'), createBootcamp);
router.route("/radius/:zipcode/:distance").get(getBootcampWithInRadius);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorise('admin', 'publisher'), updateBootcamp)
  .delete(protect, authorise('admin', 'publisher'), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorise('admin', 'publisher'), upload.single("myFile"), uploadBootcampFile)
//re-route to other routes
router
  .use("/:bootcampId/courses", coursesRoutes)

router
  .use("/:bootcampId/reviews", reviewRoutes);

module.exports = router;
