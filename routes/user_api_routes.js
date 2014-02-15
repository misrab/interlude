var publisher_controller = require('../controllers/publisher_controller.js');

module.exports = function(app) {
	app.post('/signup', function(req, res) {	
		publisher_controller.signup(req, res, function(err, result) {
			if (err) return res.send(400);
			
			// add the script publisher should put on their page into result
			// notice the &lt html escaping
			result.code = '&ltscript type="text/javascript"&gt'
						+ 'var cb = function(o) { o.masterFunction("'+result.code+'", null); };'
						+ 'var s, r, t; r = false; s = document.createElement("script"); s.type = "text/javascript";'
						+ 's.src = "//localhost:5000/client/index.js"; s.onload = s.onreadystatechange = function() {'
						+ 'if ( !r && (!this.readyState || this.readyState == "complete") ) { r = true; cb(interludeInternalObject); } };'
						+ 'document.getElementsByTagName("head")[0].appendChild(s)'
						+ '&lt/script&gt';
			
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
			res.json(200);
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
}