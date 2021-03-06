var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var jwt_secret = require('./config.js').jwt_secret;

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                return User.getByEmail(email)
                    .then(user => {
                        if (!user) {
                            return done(null, false)
                        }
                        return user.validPassword(password)
                            .then(() => {
                                throw new Error("Complete this please")
                                // user.getToken()
                            }).catch(() => {
                                return done(null, false)
                            })
                    }).catch(err => done(err))
                    // User.findOne({
                    //     'local.email': email
                    // }, function (err, user) {
                    //     if (err)
                    //         return done(err);

                //     if (!user)
                //         return done(null, false);

                //     user.validPassword(password, function (is_valid) {
                //         if (!is_valid) {
                //             return done(null, false);
                //         } else {
                //             user.getToken(function (token) {
                //                 if (!token) {
                //                     user.token = user.generateToken();
                //                     user.save();
                //                     return done(null, user);
                //                 } else {
                //                     return done(null, user);
                //                 }
                //             });
                //         }
                //     });
                // });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({
                        'local.email': email
                    }, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false);
                        } else {

                            // create the user
                            var newUser = new User();

                            newUser.local.name = req.body.name;
                            newUser.local.email = email;
                            // Deprecate due to pre save middleware
                            // newUser.local.password = newUser.generateHash(password);
                            newUser.generateToken();
                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }

                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });

        }));
}