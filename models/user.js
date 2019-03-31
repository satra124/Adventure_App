const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs"); 

var UserSchema = mongoose.Schema ({
    username:   {
        type: String,
        useCreateIndex: true
    },
    password:   String,
    email:      String      
});


var User = module.exports = mongoose.model("User", UserSchema);
var Campground      = require("../models/campground");
var Comment         = require("../models/comments");

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          console.log(err);  
        }
        else {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if (err) {
                    console.log(err)
                }
                else {
                    newUser.password = hash;
                    newUser.save(callback);
                }
            }); 
        }
    });  
};


module.exports.getUserByUsername = function(username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};

module.exports.isValidPassword = function(user, password){
  return bcrypt.compareSync(password, user.password);
};


// middleware for access to logged in users

module.exports.ensureAuthenticated = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
	    req.flash("error_msg", "Please log in to view and post" )
		res.redirect('/login');
	}
};

module.exports.checkCampOwner = function(req, res, next) {
  if (req.isAuthenticated()) {    
      Campground.findById(req.params.id, function(err, campInfo) {
         if (err) {
            req.flash("error_msg", err.message);
            res.redirect("back");
         } 
         else {
             if(campInfo.author.id.equals(req.user._id)) {
                 return next();
             }
             else {
                 req.flash("error_msg","You need to be owner to edit or delete any post.");
                 res.redirect("back");
             }
         }
      }); 
  }
  else {
      req.flash("error_msg","You need to log in to access the post");
      res.redirect("/login");
  }
};

module.exports.checkCommentOwner = function(req, res, next) {
  if(req.isAuthenticated()) {
      Comment.findById(req.params.commentId, function(err, commentInfo) {
         if (err) {
             req.flash("error_msg", "Please try again.");
             res.send(err);
         } else {
             if(commentInfo.author.id.equals(req.user._id)) {
                return next();   
             }
             else {
                 req.flash("error_msg", "You are not the comment owner. Only owner can edit orr delete comment.");
                 res.redirect("back");
             }
         }
      });
  }  else {
      res.redirect("/login");
  }
};