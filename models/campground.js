var mongoose = require("mongoose");

var campGroundSchema = mongoose.Schema({
    name        : String,
    url         : String,
    description : String,
    price       : Number,
    author      : {
                    id: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "User"
                    },
                    username: String
    },
    comments    : [{
      type  : mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }]
});

module.exports = mongoose.model("Campground", campGroundSchema);