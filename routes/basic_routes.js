// set locals user_bool if logged in or not
function userCheck(req, res, next) {
	res.locals.userBool = req.user ? true : false;
	res.locals.userId = req.user ? req.user.id : null;
	
	//console.log('### LALA: ' + res.locals.user_bool);
	next();
}

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
   		res.render("basic/plans");
	});
}

