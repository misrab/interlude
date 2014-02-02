var user_controller = require('../controllers/user_controller.js');

module.exports = function(app) {
	app.post('/signup', function(req, res) {	
		user_controller.signup(req, res, function(err, result) {
			if (err) return res.send(400);
			res.json(200, result);
		});
	});
	
	app.post('/login', function(req, res) {
		user_controller.login(req, res, function(err, result) {
			if (err) return res.send(400);
			res.json(200, result);
		});
	});
	
	app.delete('/logout', function(req, res) {
	
		user_controller.logout(req, res, function(err, result) {
			if (err) return res.send(400);
			res.json(200);
		});
	});
}