const { default: mongoose } = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
/**
 * @description get all Courses
 * @access public
 * @route GET /api/v1/bootcamps/:bootcampId/Courses
 * @route GET /api/v1/courses
 * @param {*} req
 * @param {*} res
 */
const getAllCourses = asyncHandler(async (req, res) => {

    //search query
    console.log(req.params)
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootCamp: req.params.bootcampId }).populate({
            path: 'bootcamp'
        })

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    }
    res.status(200).json(res.advancedResults);


});

/**
 * @description get Course by id
 * @access public
 * @route GET /api/v1/Courses/:id
 */
const getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findOne({ _id: req.params.id }).populate({
        path: 'bootcamp'
    });
    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        );
    }
    res.json({ course: course, success: true });
});



/**
 * @description create Course by
 * @access private
 * @route POST /api/v1/Courses
 */
const createCourse = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.body.bootcamp);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Id ${req.body.bootcamp} is not exist`, 401))
    }

    if (!bootcamp.user || bootcamp.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    req.body.bootcamp = new mongoose.Types.ObjectId(req.body.bootcamp);
    req.body.user = new mongoose.Types.ObjectId(req.user.id);
    const courseObj = new Course({
        ...req.body
    })
    const course = await courseObj.save();
    res.json({ success: true, course });
});

/**
 * @description update Course by
 * @access
 * @route PUT /api/v1/Courses/:id
 */
const updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        );
    }

    if (course.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    course.save();

    res.status(200).json({
        success: true,
        data: course
    });

});

/**
 * @description delete Course by
 * @access
 * @route DELETE /api/v1/Courses/:id
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        );
    }

    if (course.user.toString() !== req.user.id) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    await course.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });

});

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
};
