var passport = require('passport');

var publisher_controller = require('../controllers/publisher_controller.js');

module.exports = function(app) {
	app.post('/signup', function(req, res) {	
		publisher_controller.signup(req, res, function(err, result) {
			if (err) return res.send(400);
			
			// add the script publisher should put on their page into result
			// notice the &lt html escaping
			/*
			result.code = '&ltscript type="text/javascript"&gt'
						+ 'var cb = function(o) { o.masterFunction("'+result.code+'", null); };'
						+ 'var s, r, t; r = false; s = document.createElement("script"); s.type = "text/javascript";'
						+ 's.src = "//localhost:5000/client/index.js"; s.onload = s.onreadystatechange = function() {'
						+ 'if ( !r && (!this.readyState || this.readyState == "complete") ) { r = true; cb(interludeInternalObject); } };'
						+ 'document.getElementsByTagName("head")[0].appendChild(s)'
						+ '&lt/script&gt';
			*/
			res.json(200, result);
		});
	});
	
	app.post('/login', function(req, res) {
		publisher_controller.login(req, res, function(err, result) {
			if (err) return res.send(400);
			res.json(200, result);
		});
	});
	
	app.delete('/logout', function(req, res) {
		publisher_controller.logout(req, res, function(err, result) {
			if (err) return res.send(400);
			res.send(200);
		});
	});
	
	app.put('/publisher', function(req, res) {
		if (!req.user) return res.send(400, 'Permission denied');
		
		var object = {
			userId:			req.user.id,
			email:			req.body.email,
			oldPassword: 	req.body.oldPassword,
			newPassword: 	req.body.newPassword
		};
		publisher_controller.changeAttribute(req.user, object, function(err, result) {
			if (err) return res.json(400, err);
			res.json(200, result);
		});
		//console.log('### EMAIL: ' + req.body.email);
		//console.log('### OLDPASS: ' + req.body.oldPassword);
	});
	
	
	function cors(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  next();
	};
	// GET /auth/facebook
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Facebook authentication will involve
	//   redirecting the user to facebook.com.  After authorization, Facebook will
	//   redirect the user back to this application at /auth/facebook/callback
	app.get('/auth/facebook', cors,
	  passport.authenticate('facebook'),
	  function(req, res){
		// The request will be redirected to Facebook for authentication, so this
		// function will not be called.
	  });

	// GET /auth/facebook/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
		res.redirect('/');
	  });
}