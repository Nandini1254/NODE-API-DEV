const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgReview = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }]);


  //calculate average
  try {
    if (obj[0]) {

      await this.model("Bootcamp").findOneAndUpdate({ _id: bootcampId },
        {
          $set: {
            averageRating: obj[0].averageRating.toFixed(1),
          }
        },
        {
          new: true,
        });
    }

  } catch (err) {
    console.error(err);
  }
};



ReviewSchema.post("save", async function () {
  await this.constructor.calculateAvgReview(this.bootcamp);
});

ReviewSchema.post("deleteOne", async function () {
  await this.constructor.calculateAvgReview(this.bootcamp);
});


module.exports = mongoose.model('Review', ReviewSchema);