const express = require("express");
const { getCourse, createCourse, getAllCourses, updateCourse, deleteCourse } = require("../controllers/courses");
const advancedResults = require("../middleware/advancedResults");
const Course = require("../models/Course");
const { protect, authorise } = require("../middleware/auth");
const router = express.Router({mergeParams: true});

router.route("/").get(advancedResults(Course, {
    path: 'bootcamp'
}), getAllCourses).post(protect, authorise('admin', 'publisher'), createCourse);

router
    .route("/:id")
    .get(getCourse)
    .put(protect, authorise('admin', 'publisher'), updateCourse)
    .delete(protect, authorise('admin', 'publisher'), deleteCourse);

module.exports = router;
