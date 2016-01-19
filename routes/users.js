'use strict'
var express = require('express');
// For the needs of separating routers into different apps use:
// var router = express.Router('mergeParams'); // check syntax, may be ({mergeParams:true})
// This enables:
// Preserve the req.params values from the parent router. 
// If the parent and the child have conflicting param names,
// the child’s value take precedence.
var router = express.Router();
// Note that middleware functions like router.use(function(req,res, next)) 
// can be added to the router same way as to the app
// and will be invoked for every request that is passed to this router

// Note:
// only requests to /calendar/* will be sent to our "router"
// app.use('/calendar', router);

// Note: An interesting idea is to set 
// router.all('*', requireAuthentication, loadUser);
// if a user is required to be loaded for every request in this router app

// Note: the router supports pattern macthing
// router.all('/api/*', requireAuthentication);

// Note: interesting idea
// You can provide multiple callbacks, and all are treated equally, 
// and behave just like middleware, except that these callbacks may invoke next('route') 
// to bypass the remaining route callback(s). You can use this mechanism to 
// perform pre-conditions on a route then pass control to subsequent routes 
// when there is no reason to proceed with the route matched.

// Note: useful for Params:
// the following function will be called only once per request that includes :user in it
// no matter how many middleware functions serve this request
// router.param('user', function(req, res, next, id) {
// router.get('/user/:id', function (req, res) {

//
// Important note app.use(router) is absolutely possible because the router is also an app
// app.use('/foo', router);
//

// Note for login: can be done with: router.route(<path>) because it has get post and w/e
// http://expressjs.com/en/api.html#router.route

var login_strategies = require('../config/login-strategies');
var urls = require('./urls');


// TODO: try to separate routers on different apps

module.exports = function (passport) {
  return {
    login: function (req, res, next) {
      res.render('login', function (err, html) {
        if (!err)
          res.write(html);
        res.end();
      });
    },

    checkRememberMe: login_strategies.login_remember_me,

    loginPost: passport.authenticate('local-login', {
      successRedirect: urls.profile,
      failureRedirect: urls.login
    }),
    showProfile: function (req, res, next) {
      var user = {
        local: {
          email: req.user.local.email,
          avatar: req.user.avatar
        }
      };
      res.render('profile', locals({
        user: user
      }));
    },
    signup: function (req, res) {
      res.render('signup');
    },
    signupPost: passport.authenticate('local-signup', {
      successRedirect: urls.profile,
      failureRedirect: urls.signup
    }),
    logout: function (req, res) {
      res.clearCookie('remember_me');
      req.logout();
      res.redirect('/');
    },
    changeProfile: function (req, res) {
      res.redirect('back');
    }
  }
};

// TODO make this function global for all routers

/**
 * This function is used to pass parameters to the templates
 * and include parameters that are global for all templates
 */

function locals(obj) {
  var globals = {
    urls: urls
  }
  return extend(globals, obj);
}

/**
 * Extends the obj with the src and overwrites obj values
 * when obj and src keys are equal
 */

function extend(obj, src) {
  Object.keys(src).forEach(function (key) {
    obj[key] = src[key];
  });
  return obj;
}