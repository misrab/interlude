var async = require('async');
var crypto = require('crypto');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Publisher = require('../models/index.js').pg.Publisher;

/*
 * Passport serialization and local strategy
 */
// Define local strategy for Passport
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  }, function(username, password, done) {
  	//console.log('### passport is authenticating User');
  	Publisher.authenticate(username, password, done);
  }
));

// serialize user on login
passport.serializeUser(function(user, done) {
  //console.log('serializing user\n');
  done(null, user.id);
});
// deserialize user on logout
passport.deserializeUser(function(id, done) {
  Publisher.find(id).success(function(user) {
    done(null, user);
  }).error(function(error) {
    done(error, null);
  });
});

function signup(req, res, next) {
	
	// check email and password not null
	if (!req.body.email || !req.body.password) {
		return next(null, { success: false, message: 'Email and password are required' });
		//var error = new Error('Email and password are required');
		//return next(error);
	}
	
	// check plan valid
	var plan = parseInt(req.body.plan.trim());
	if (!req.body.plan || isNaN(plan) || plan<0 || plan>2) {
		return next(null, { success: false, message: 'Invalid feature plan' });
	}
	
	async.waterfall(
	[
		//builds user
		function(callback){

			
			var email = req.body.email.trim();
			
			// create secret
			var secret = crypto.randomBytes(20).toString('hex');
			
			console.log('###1 secret: ' + secret);
			//var pat = /[^@]*/i;
			//var username = pat.exec(email);
			//username = username[0];

			var newPublisher = Publisher.build(
			{
				email: 	email,
				plan:	plan,
				secret:	secret
			});
			newPublisher.setPassword(req.body.password, function(err, newPub) {
				callback(err, newPub, secret);
			});
		},

		//saves user
		function(newPublisher, secret, callback){
			console.log('###2 secret: ' + secret);
		
			newPublisher.save().success(function(user){
				return callback(null, user, secret);
			}).error(callback);
		},

		//logs user in
		function(savedUser, secret, callback) {
			console.log('###3 secret: ' + secret);
		
			if(!savedUser){
				var errorMessage = "## Error inserting user into database on signup";
				var insertionError = new Error(errorMessage);
				//console.log(errorMessage);
				return callback(insertionError);
			}
			
			req.login(savedUser, function(err) {
				if(err) return callback(err);
				return callback(null, savedUser, secret);
			});
		}			
	], function(err, user, secret) {
		var result = {};
		result.code = null;
		if (err && err.code === "23505") {
			result.success = false;
			result.message = 'Email address already exists';
			return next(null, result);
			//return res.send(200, JSON.stringify(result));
		} else if (err) {
			return next(err, null);
		}
		
		// success
		result.code = secret;
		result.success = true;
		return next(null, result);
	});
}
	
function login(req, res, next) {
	async.waterfall([
		// checks to see if user is authenticated
		function(callback){
			passport.authenticate('local', function(err, user, info) {			
				return callback(err, user);
			})(req, res, callback);
		}, 
		//logs user in
		function(user, callback){
			// to avoid serializing
			if (!user) return callback(null, null);
			
			req.login(user, function(err) {
				if (err) return callback(err);
				return callback(null, user);
			});
		}
	], function(err, user){
		var result = {};
		
		// dealing with these together
		if (err || !user) {
			result.success = false;
			result.message = 'Invalid email or password';
			return next(null, result);
			//return res.send(200, JSON.stringify(result));
		}
		
		result.success = true;
		next(null, result);
	});
}

function logout(req, res, next) {
	req.logout();
  	next(null, null);
}

/*
function modifyUserHelper(object, user, next) {
	if (!user) {
		var err = new Error('No user found');
		return next(err);
	}
	// update
	if (object.user_name) user.user_name = object.user_name;
	
	if (object.password) {	
		user.setPassword(object.password, function(err, user) {
			if (err) {
				return next(err);
			}
			
			user.save().success(function(){
				return next(null, user);
			}).error(function(err) {
				next(err);
			});
		});
	// else save right away
	} else {
		// save
		user.save().success(function(){
			return next(null, user);
		}).error(next);
	}
}

function modifyUser(object, next) {
	var User = api_helper.retrieveModel("User");
 	User.find(object.id).success(function(user){
 		modifyUserHelper(object, user, next);
 	}).error(next);
 */

// for user to change attribute, i.e. email, password
// expect object.userId + object.email || object.oldPassword + object.newPassword
function changeAttribute(user, object, next) {
	async.waterfall([
		// find user/publisher
		function(cb) {
			Publisher.find(object.userId).success(function(pub) {
				cb(null, pub);
			}).error(cb);
		},
		// modify
		function(publisher, cb) {		
			if (!publisher) {
				var err = new Error('No publisher found');
				return cb(err);
			}
			
			// change email
			if (object.email) {
				
				publisher.email = object.email;
				publisher.save().success(function(){
					return cb(null, publisher);
				}).error(cb);
			// change password: check then change
			} else {
				// check
				user.verifyPassword(object.oldPassword, function(err, answer) {
					if (err) return cb(err);
					if (answer==false) {
						var err = new Error('Invalid password');
						return cb(err);
					}
					// all ok, change password
					publisher.setPassword(object.newPassword, function(err, publisher) {
						if (err) return cb(err);
						// save
						publisher.save().success(function(){
							return cb(null, publisher);
						}).error(cb);
					});		
				});
				
			}
		}
	], next);
}

module.exports = {
	signup:				signup,
	login:				login,
	logout:				logout,
	changeAttribute:	changeAttribute
}