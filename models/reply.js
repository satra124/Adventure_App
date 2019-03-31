var mongoose = require("mongoose");

var replySchema = mongoose.Schema({
   text     : String,
   author   : String
});


module.exports = mongoose.model("Reply", replySchema);
