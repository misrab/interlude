module.exports = function(app) {
	require('./basic_routes')(app);
	require('./user_api_routes')(app);
	
	require('./admin_routes')(app);
}
