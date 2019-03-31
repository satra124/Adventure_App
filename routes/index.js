var express         = require("express"),
    app             = express.Router(),
    passport        = require("passport"),
    session         = require("express-session"),
    User            = require("../models/user"),
    expValidator    = require("express-validator"),
    cookieParser    = require("cookie-parser"),
    methodOverride  = require("method-override");

// cookie parser

app.use(cookieParser());

// user method override

app.use(methodOverride("_method"));

// middleware for express session

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// configure express-validators

app.use(expValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root      = namespace.shift(),
            formParam = root; 
        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param:  formParam,
            msg:    msg,
            value:  value
        };
    }
}));

// configure passport

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = app;