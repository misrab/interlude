var express = require("express")
	, stylus = require('stylus')
  	, nib = require('nib');
  	
var app = express(); 
 
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/tpl');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));
 
/*
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
*/

app.get("/", function(req, res){
    res.render("page");
});


var port = process.env.PORT || 5000; 

//app.listen(port);
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);
console.log('### Environment is: ' + process.env.NODE_ENV);


io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});