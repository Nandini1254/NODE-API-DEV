const mongoose = require("mongoose");
const geocoder = require("../utils/geoCoder");

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please add name"],
    trim: true,
    maxLength: [50, "Name should be max 50 words"],
    unique: true,
  },
  Slug: String,
  description: {
    type: String,
    required: [true, "please add Description"],
    maxLength: [200, "Name should be max 50 words"],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "please add valid url",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is requried"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "please add valid Email",
    ],
  },
  address: {
    type: String,
    required: [true, "Address is requried"],
  },
  location: {
    //geoJson point
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    zipcode: String,
    state: String,
    country: String,
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
    averageRating: {
      type: Number,
      min: [1, "Rating min 1"],
      max: [10, "Rating max 10"],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: "no-photo.png",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
  },
},
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict:false
  });


//cascade/delete forienkey values
BootcampSchema.pre("deleteOne", { document: true }, async function(next){
  await this.model('Course').deleteMany({ bootcamp: this._id});
  next();
})


//reverse populate list of courses, 
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});

BootcampSchema.pre("save", async function (next) {
  //geocoder field
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  this.address = undefined;
  next();
})

module.exports = mongoose.model("Bootcamp", BootcampSchema);
