var express         = require("express"),
    app             = express(),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    os		= require("os");	

// connect flash

app.use(flash());
  
// Parse the HTML body to get required input
app.use(bodyParser.urlencoded({extended: true}));

// Connect to MongoDB and create a object along with schema
mongoose.connect('mongodb://mongo:27017/campdb',{useNewUrlParser: true, useUnifiedTopology: true});

// To set the view engine as EJS
app.set("view engine", "ejs");

// use custom scripts, stylesheets
app.use(express.static(__dirname + "/public"));

// use dotenv for development
if (process.env.NODE_ENV == 'production') {
    require('dotenv').load();
}

const stripePublicKey=process.env.STRIPE_PUBLIC_KEY;
const stripeSecretKey=process.env.STRIPE_SECRET_KEY;

//================
// Baseline Config
//================

var indexRoute = require("./routes/index");

app.use(indexRoute);

// Global variables

app.use(function(req, res, next) {
    res.locals.currentUser  = req.user;
    res.locals.success_msg  = req.flash("success_msg");
    res.locals.error_msg    = req.flash("error_msg");
    next();
});

//==================
// Campground Routes
//==================

var campgroundRoutes = require("./routes/campground");

app.use(campgroundRoutes);

//===============
// Comments route
//===============

var commentRoutes = require("./routes/comments");

app.use(commentRoutes);


// ==========
// AUTH ROUTE
// ==========


var authRoutes = require("./routes/authentication");

app.use(authRoutes);


// Node Js Server listen
var port = 3012;
var host = os.hostname();
app.listen(port, host, function() {
   console.log("Server started on IP:" + host + " and port:" + port); 
});
