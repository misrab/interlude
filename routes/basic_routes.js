/*
 *	Imports
 */
var publisherController = require('../controllers/publisher_controller');
 

/*
 *	Internal Functions
 */

// set user locals
function userCheck(req, res, next) {
	res.locals.userBool = req.user ? true : false;
	res.locals.userId = req.user ? req.user.id : null;
	res.locals.userEmail = req.user ? req.user.email : null;
	res.locals.userPlan = req.user ? req.user.plan : null;
	
	//console.log('### LALA: ' + res.locals.user_bool);
	next();
}


/*
 *	Module.exports
 */
module.exports = function(app) {
	// Middleware for all routes
	app.post('/*', userCheck);
	app.get('/*', userCheck);
	app.put('/*', userCheck);
	app.delete('/*', userCheck);
	
	
	app.get("/about", function(req, res) {
		res.render("basic/about");
	});
	app.get("/terms", function(req, res) {
		res.render("basic/terms");
	});
	
	// Routes
	app.get("/", function(req, res) {
		if (req.user) return res.redirect('/dashboard');
		
   		res.render("basic/landing");
	});
	
	app.get("/plans", function(req, res){
		if (req.user) return res.redirect('/dashboard');
	
   		res.render("basic/plans");
	});
	
	app.get("/dashboard", function(req, res){
		if (!req.user) return res.redirect('/');
		
		publisherController.getPublisherUrls(req.user.secret, function(err, urls) {
			if (err) return res.json(400, err);
			res.render('basic/dashboard', { urls: urls });
		});
		
   		//res.render("basic/account");
	});
	
	app.get("/account", function(req, res){
		if (!req.user) return res.redirect('/');
	
	
		// notice embedded html like <br>
		// and escaped tags like &lt
		var script = '&ltscript type="text/javascript"&gt <br>'
		+ 'var interludeVariable_cb = function(o) { o.masterFunction("'+req.user.secret+'", null); };'
		+ 'var interludeVariable_s, interludeVariable_r, interludeVariable_t; interludeVariable_r = false;'
		+  'interludeVariable_s = document.createElement("script"); interludeVariable_s.type = "text/javascript";'
		+ 'interludeVariable_s.src = "//localhost:5000/client/index.js"; interludeVariable_s.onload = interludeVariable_s.onreadystatechange = function() {'
		+ 'if ( !interludeVariable_r && (!this.readyState || this.readyState == "complete") ) { interludeVariable_r = true; interludeVariable_cb(interludeInternalObject); } };'
		+ 'document.getElementsByTagName("head")[0].appendChild(interludeVariable_s)'
		+ '<br> &lt/script&gt';

   		res.render("basic/account", { script: script });
	});
	
	
	// callback with facebook user /me object
	/*
	app.post('/auth/facebook/callback', function(req, res) {

		console.log('### REACHED: POST /auth/facebook/callback');
		publisherController.facebookCallback(req, res, function(err) {
			if (err) return res.json(400, err);
			res.send(200, null);
		});
	});*/
}

