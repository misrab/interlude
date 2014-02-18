function clickUrl(e) {
	e.preventDefault();
	
	// make this url button active
	$('.url').removeClass('active');
	$(this).addClass('active');
	
	// set hidden input active url
	var url = $(this).html();
	$('#activeUrl').val(url);
	

	// give message that chat changes
	refreshMessages('<span style="font-weight: bold;">Now listening to '+url+'</span>');
	
	// show relevant chat
	socketListen($('#activeUrl').val(), 'anonymous');
}

var SERVER_LOCATION = "//localhost:5000";
var socket;
var messages = [];


function refreshMessages(newMsg) {
	messages.push(newMsg);
	var html = '';
	for(var i=0; i<messages.length; i++) {
		html += messages[i] + '<br />';
	}

	var liveChat = $('#liveChat');
	liveChat.html(html);
	// scroll read field to bottom
	liveChat.scrollTop(liveChat.prop("scrollHeight"));
}
function socketListen(url, channel) {
	if (!url || !channel || url=='' || channel=='') {
		console.log('Error listening on socket given url and channel');
		return;
	}
	
	// remove all listeners
	socket.removeAllListeners();
	
	socket.on('message-'+url+'-'+channel, function (data) {		
		if (data.message) {
			refreshMessages(data.message);
		} else {
			console.log("There is a problem:", data);
		}
	});
}

$(function() {
	$('.url').click(clickUrl);
	
	socket = io.connect(SERVER_LOCATION);
	socketListen($('#activeUrl').val(), 'anonymous');
});