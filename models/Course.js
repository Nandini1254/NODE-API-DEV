const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

//static method to calculate average cost value
CourseSchema.statics.getAverageCost = async function (bootcamp) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcamp }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }]);

    const averageCost = Math.ceil(obj[0].averageCost / 10) * 10 || undefined;
    try {
        await this.model("Bootcamp").findOneAndUpdate({ _id: bootcamp },
            {
                $set: {
                    averageCost: averageCost,
                }
            },
            {
                new: true,
            });
    }
    catch (err) {
        // console.log(err);
    }
}

CourseSchema.post("save", async function () {
    //call getAveragecost method
    await this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre("deleteOne", async function (next) {
    //call getAveragecost method
    await this.constructor.getAverageCost(this.bootcamp);
    next();
})

// Call getAverageCost after tuition update
CourseSchema.post("findOneAndUpdate", async function (doc) {
    if (this.tuition != doc.tuition) {
        await doc.constructor.getAverageCost(doc.bootcamp);
    }
});


module.exports = mongoose.model("Course", CourseSchema);
