var async = require('async');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/index.js').pg.User;

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
  	User.authenticate(username, password, done);
  }
));

// serialize user on login
passport.serializeUser(function(user, done) {
  //console.log('serializing user\n');
  done(null, user.id);
});
// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.find(id).success(function(user) {
    done(null, user);
  }).error(function(error) {
    done(error, null);
  });
});

function signup(req, res, next) {
	
	// check email and password not null
	if (!req.body.email || !req.body.password) {
		return next(null, {success:false, message:'Email and password are required'});
		//var error = new Error('Email and password are required');
		//return next(error);
	}
	
	async.waterfall(
	[
		//builds user
		function(callback){

			var pat = /[^@]*/i;
			var email = req.body.email.trim();
			var username = pat.exec(email);
			username = username[0];

			var newUser = User.build(
			{
				email: email,
				user_name: username
			});
			newUser.setPassword(req.body.password, callback);
		},

		//saves user
		function(newUser, callback){
			newUser.save().success(function(user){
				return callback(null, user);
			}).error(callback);
		},

		//logs user in
		function(savedUser, callback){
			if(!savedUser){
				var errorMessage = "## Error inserting user into database on signup";
				var insertionError = new Error(errorMessage);
				//console.log(errorMessage);
				return callback(insertionError);
			}
							
			req.login(savedUser, function(err) {
				if(err) return callback(err);
				return callback(null, savedUser);
			});
		}			
	], function(err, user){
		var result = {};
		if (err && err.code === "23505") {
			result.success = false;
			result.message = 'Email address already exists';
			return next(null, result);
			//return res.send(200, JSON.stringify(result));
		} else if (err) {
			return next(err, null);
		}

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

module.exports = {
	signup:			signup,
	login:			login,
	logout:			logout
}