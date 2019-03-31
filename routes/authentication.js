var express         = require("express"),
    app             = express.Router(),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local").Strategy,
    User            = require("../models/user"),
    Campground      = require("../models/campground");
    
var errors = undefined;

// Register Route

app.get("/register", function(req, res) {
   res.render("login/register",{errors: errors}); 
});

// Register Logic

app.post("/register", function(req, res) {
   var username         = req.body.username;
   var password1        = req.body.password1;
   var password2        = req.body.password2;
   var email            = req.body.email;
   // Validations
   req.checkBody('username', "Name is required").notEmpty();
   req.checkBody('password1', "Password is required").notEmpty();
   req.checkBody('password2', "Passwords should match").equals(req.body.password1);
   req.checkBody('email', 'Email Id is required').notEmpty();
   var errors = req.validationErrors();
   
   if (errors) {
       console.log(errors);
       //req.flash("error_msg", errors);
       return res.render("login/register");
   }
   else {
       var newUser = new User({
          username: username,
          email: email,
          password: password1
       });
   }
   
   User.getUserByUsername(newUser.username, function(err, user1) {
      if (err) throw err;
      if (!user1) {
        User.createUser(newUser, function(err, user){
            if(err) throw err;
            req.flash("success_msg", "You are successfully registered. Please login.")
            res.redirect("/login");
        });  
      }
      else {
            req.flash("error_msg", "Cannot register. Username " + user1.username + " already exist");
            res.redirect("/register");
      }
   });
   

});

// Login Get Route

app.get("/login", function(req, res) {
    res.render("login/login");
});        


// Login Logic

passport.use(new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          req.flash("error_msg","User not found.");
          return done(null, false);                 
        }
        // User exists but wrong password, log the error 
        User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if(isMatch) {
            req.flash("success_msg", "You are logged in");
            return done(null, user);
        } else {
            req.flash("error_msg", "Invalid password");
            return done(null, false);
        }
    });
      }
    );
}));


app.post("/login", passport.authenticate('local', {
    successFlash: true,
    successRedirect: "/campgrounds",
    failureFlash: true,
    failureRedirect: "/login"
}), function(req, res) {
    Campground.findById(req.params.id, function(err, campInfo) {
      if(err) {
          req.flash("error_msg", err.message);
      } else {
          res.redirect("/campgrounds");
      }
    });
});

// Logout Route

app.get('/logout', function (req, res) {
	req.logout();
	req.flash("success_msg", "Your are logged out");
	res.redirect('/login');
});

module.exports = app;