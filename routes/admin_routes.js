/*
 *	Imports
 */
var publisherController = require('../controllers/publisher_controller');
 

/*
 *	Internal Functions
 */



/*
 *	Module.exports
 */
module.exports = function(app) {
	app.get('/admin', function(req, res) {
		publisherController.getAllPublishers(function(err, results) {
			if (err) return res.send(400);
			
			res.render("admin/index", { publishers: results });
		});
	});
}