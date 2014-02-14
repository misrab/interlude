/*
 *	Imports
 */

 

/*
 *	Internal Functions
 */

// set user locals
function userCheck(req, res, next) {
	res.locals.userBool = req.user ? true : false;
	res.locals.userId = req.user ? req.user.id : null;
	res.locals.userEmail = req.user ? req.user.email : null;
	
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
	
	
	// Routes
	app.get("/", function(req, res){
   		res.render("basic/landing");
	});
	
	app.get("/plans", function(req, res){
		if (req.user) return res.redirect('/dashboard');
	
   		res.render("basic/plans");
	});
	
	app.get("/dashboard", function(req, res){
		if (!req.user) return res.redirect('/');
		
		res.send(200, 'dashboard');
   		//res.render("basic/account");
	});
	
	/*
	= '&ltscript type="text/javascript"&gt'
	+ 'var cb = function(o) { o.masterFunction("'+result.code+'", null); };'
	+ 'var s, r, t; r = false; s = document.createElement("script"); s.type = "text/javascript";'
	+ 's.src = "//localhost:5000/client/index.js"; s.onload = s.onreadystatechange = function() {'
	+ 'if ( !r && (!this.readyState || this.readyState == "complete") ) { r = true; cb(interludeInternalObject); } };'
	+ 'document.getElementsByTagName("head")[0].appendChild(s)'
	+ '&lt/script&gt';
	*/
	app.get("/account", function(req, res){
		if (!req.user) return res.redirect('/');
	
	
		// notice embedded html like <br>
		// and escaped tags like &lt
		var script = '&ltscript type="text/javascript"&gt <br>'
		+ 'var cb = function(o) { o.masterFunction("'+req.user.secret+'", null); };'
		+ 'var s, r, t; r = false; s = document.createElement("script"); s.type = "text/javascript";'
		+ 's.src = "//localhost:5000/client/index.js"; s.onload = s.onreadystatechange = function() {'
		+ 'if ( !r && (!this.readyState || this.readyState == "complete") ) { r = true; cb(interludeInternalObject); } };'
		+ 'document.getElementsByTagName("head")[0].appendChild(s)'
		+ '<br> &lt/script&gt';

   		res.render("basic/account", { script: script });
	});
}

