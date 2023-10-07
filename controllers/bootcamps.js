const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geoCoder");


/**
 * @description get all bootcamps
 * @access public
 * @route GET /api/v1/bootcamps
 * @param {*} req
 * @param {*} res
 */
const getAllBootcamps = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @description get Bootcamp by id
 * @access public
 * @route GET /api/v1/bootcamps/:id
 */
const getBootcamp = asyncHandler(async (req, res) => {
  const bootcamp = await Bootcamp.findOne({ _id: req.params.id }).populate('courses');
  res.json({ bootcamp: bootcamp, success: true });
});

/**
 * @description get Bootcamp by /radius/:zipcode/:distance
 * @access public
 * @route GET /api/v1/bootcamps/:id
 */
const getBootcampWithInRadius = asyncHandler(async (req, res) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;
  //divide distance by 3963 mile(earth radius)
  const radius = distance / 3963
  const bootcamp = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[long, lat], radius]
      }
    }
  });
  res.status(200).json({ bootcamp: bootcamp, success: true });
});

/**
 * @description create Bootcamp by
 * @access Private
 * @route POST /api/v1/bootcamps/:id
 */
const createBootcamp = asyncHandler(async (req, res) => {
  //add user to req.body
  req.body.user = req.user._id;

  const bootcamp = await Bootcamp.create(req.body);
  res.json({ success: true, bootcamp });
});

/**
 * @description update Bootcamp by  
 * @access Private
 * @route PUT /api/v1/bootcamps/:id
 */
const updateBootcamp = asyncHandler(async (req, res) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }


  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    upsert: false
  });

  res.status(200).json({ success: true, data: bootcamp });


});

/**
 * @description delete Bootcamp by
 * @access
 * @route DELETE /api/v1/bootcamps/:id
 */
const deleteBootcamp = asyncHandler(async (req, res) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  await bootcamp.deleteOne();

  res.status(200).json({ success: true, data: {} });

});

/**
 * @description upload photo Bootcamp by
 * @access Private
 * @route PUT /api/v1/bootcamps/:id/photo
 */
const uploadBootcampFile = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.file) {
    return next(
      new ErrorResponse(`please file upload`, 400)
    );
  }


  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, { $set: { photo: req.file.filename } }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: req.files });


});


module.exports = {
  getAllBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithInRadius,
  uploadBootcampFile
};
