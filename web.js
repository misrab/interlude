var express = require("express")
	, stylus = require('stylus')
  	, nib = require('nib')
  	, passport = require('passport')
  	, url = require('url')
  	, db_pg = require('./models').pg;
  	
var SecretUrl = db_pg.SecretUrl;

  
/*
 *	Redis Client
 */

function createRedisClient() {
	if (process.env.REDISTOGO_URL) {
		var redisUrl = url.parse(process.env.REDISTOGO_URL);
		var redisAuth = redisUrl.auth.split(':');
		var client = require("redis").createClient(redisUrl.port, redisUrl.hostname);
		client.auth(redisAuth[1]);
	} else {
		var client = require("redis").createClient(6379, 'localhost');
	}
	return client;
}

var RedisStore = require('connect-redis')(express);
var client = createRedisClient();
if (process.env.REDISTOGO_URL) {

	// TODO: redistogo connection
	// redis store
	var redisUrl = url.parse(process.env.REDISTOGO_URL);
	var redisAuth = redisUrl.auth.split(':');
	
	var redisClient = new RedisStore({
                          host: redisUrl.hostname,
                          port: redisUrl.port,
                          db: redisAuth[0],
                          pass: redisAuth[1],
                          client: client
                        });
} else {
	//var redis = require("redis").createClient(6379, 'localhost');
	var redisClient = new RedisStore({
                          host: 'localhost',
                          port: 6379,
                          client: client
                        });
}



/*
 *	Express app
 */

  	
var app = express(); 

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/images/favicon.png'));
 
 
// Passport and Sessions
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ 
  store: redisClient 
  , secret: 'teafortwo'
  }, function() {
    app.use(app.router);
  }));
app.use(passport.initialize());
app.use(passport.session());

 
 
/*
 *	Routes
 */
require('./routes/index.js')(app);


/*
 *	Server listening
 */

var port = process.env.PORT || 5000;


var clearDB = null;
clearDB = function(next) { next(null); };
//clearDB = function(next) { db_pg.sequelize.drop().complete(next); };

// on client first message, adds secret-url combo to db if not already there
// for use with dashboard: know secret, want urls
function updateSecretUrlDb(secret, url) {
	SecretUrl
		.findOrCreate({secret: secret, url: url});
		/*
		.success(function(user, created) {
			console.log('### CREATED: ' + created);
		});*/
}

clearDB(function(err) {
	db_pg.sequelize.sync().complete(function(err) {
		if (err) { throw err }
		console.log ('### Succeeded connecting to: ' + db_pg.url + ' ###');
		
		var io = require('socket.io').listen(app.listen(port));
		io.set('log level', 1); // reduce logging
		
		
		// Heroku allow websockets
		io.configure(function () { 
		  io.set("transports", ["xhr-polling"]); 
		  io.set("polling duration", 10); 
		});
		
		
		console.log("### Listening on port " + port);
		console.log('### Environment is: ' + process.env.NODE_ENV);
		
		io.sockets.on('connection', function (socket) {
			// note: socket vs io.sockets    
			// expect message and url
			socket.on('send', function(data) {
				var url = data.url;
				var channel = data.channel;
				
				if (data.firstBool) updateSecretUrlDb(data.secret, data.url);
				//console.log('### firstBool: ' + data.firstBool);
				
				// don't want to send unnecessary data
				var newData = { message: data.message };
				//var msg = data.message;
				io.sockets.emit('message-'+url+'-'+channel, newData);
			});
		});
	});
});