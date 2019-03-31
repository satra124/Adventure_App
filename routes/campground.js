var express         = require("express"),
    app             = express.Router(),
    Campground      = require("../models/campground"),
    User            = require("../models/user");

// To get list of campgrounds
app.get("/", function(req,res) {
    // res.redirect("/campgrounds");
    res.render("home");
});

app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, listCamps) {
        if (err) {
            req.flash("error_msg", err.message);
        }
        else {
          res.render("campground/campgrounds", {getCampList:listCamps});  
        }
    });
});

// To post a new camp
app.post("/campgrounds", function(req,res) {
  var name = req.body.name;
  var imageURL = req.body.image;
  var description = req.body.description;
  var author = {
                id: req.user._id,
                username: req.user.username
  };
  var price = req.body.price;
  var newCampingVenue = {name: name, url: imageURL, description: description, author: author, price: price};
  Campground.create(newCampingVenue, function(err, newCamp) {
      if(err) {
         req.flash("error_msg", err.message);
         res.redirect("back");
      }
      else {
        req.flash("success_msg", "New post created for " + newCamp.author.username);  
        res.redirect("/campgrounds");  
      }
  });
});

// Redirect to camp page
app.get("/campgrounds/new", User.ensureAuthenticated , function(req,res) {
    res.render("campground/new");
});

app.get("/campgrounds/:id", User.ensureAuthenticated, function(req, res) {
   Campground.findById(req.params.id).populate("comments").exec(function(err, campInfo) {
       if(err) {
          req.flash("error_msg", err.message);
          res.redirect("back");
       }
       else {
           res.render("campground/info",{campInfo: campInfo});
       }
   });
});

// Edit Route

app.get("/campgrounds/:id/edit", User.checkCampOwner, function(req, res) {
    Campground.findById(req.params.id, function(err, campInfo) {
       if (err) {
           res.redirect("/login");
       }
       else {
            res.render("campground/edit",{campInfo: campInfo}); 
       }
    });
});

// Update Route

app.put("/campgrounds/:id", User.checkCampOwner, function(req, res) {
   Campground.findOneAndUpdate(req.params.id, req.body.campgrounds, function(err, updatedCampground) {
       if(err) {
           res.redirect("back");
       }
       else {
            res.redirect("/campgrounds/" + req.params.id);
       }
   }); 
});

// Delete Route

app.delete("/campgrounds/:id", User.checkCampOwner, function(req, res) {
   Campground.findOneAndDelete(req.params.id,function(err) {
      if(err) {
          res.redirect("back");
      }
      else {
        res.redirect("/campgrounds");    
      }
   }); 
});


module.exports = app;