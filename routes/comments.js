var express         = require("express"),
    app             = express.Router(),
    Campground      = require("../models/campground"),
    User            = require("../models/user"),
    Comment         = require("../models/comments");


// List all comments

app.get("/campgrounds/:id/comments", function(req, res) {
    Campground.findById(req.params.id, function(err, campInfo) {
       if (err) {
            res.send(err);
       } 
       else {
            res.render("comment/comments",{campInfo: campInfo});   
       }
    });
});

// Post new comments

app.post("/campgrounds/:id", User.ensureAuthenticated, function(req, res) {
    Campground.findById(req.params.id, function(err, campInfo) {
        if (err) {
            res.send("err");
        }
        else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    res.send(err);
                }
                else {
                    // add user info to the comment model
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // comment.commentId = req.params.id;
                    // res.redirect("/campgrounds/" + req.params.id);
                    comment.save();
                    campInfo.comments.push(comment);
                    campInfo.save();
                    res.redirect("/campgrounds/" + campInfo._id);
                }
            });
        }
    });
});

// edit comments

app.get("/campgrounds/:id/comments/:commentId/edit", User.checkCommentOwner, function(req, res) {
   Campground.findById(req.params.id, function(err, campInfo) {
       if(err) {
           res.send(err);
       } else {
           Comment.findById(req.params.commentId, function(err, comment) {
               if (err) {
                   res.send(err);
               }
               else {
                   res.render("comment/edit",{campInfo:campInfo, comment:comment});
               }
           });
       }
   });   
});


// update comment

app.put("/campgrounds/:id/comments/:commentId", User.checkCommentOwner, function(req, res) {
    Comment.findOneAndUpdate(req.params.commentId, req.body.comment, function(err, updatedComment) {
        console.log(req.params.commentId);
       if(err) {
            req.flash("error_msg", "We are unable to process the request at this moment");   
       } else {
           req.flash("success_msg", "Comment updated successfully");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// destroy comment

app.delete("/campgrounds/:id/comments/:commentId", User.checkCommentOwner, function(req, res) {
   Comment.findOneAndDelete(req.params.commentId,function(err) {
      if(err) {
          req.flash("error_msg", "We are unable to process the request at this moment");
          res.redirect("back");
      }
      else {
        req.flash("success_msg", "Successfully deleted the comment");  
        res.redirect("/campgrounds/" + req.params.id);    
      }
   }); 
});

module.exports = app;