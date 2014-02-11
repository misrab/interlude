module.exports = function(app) {
	app.get("/", function(req, res){
   		res.render("basic/landing");
	});
	
	app.get("/plans", function(req, res){
   		res.render("basic/plans");
	});
}

