
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
	
	// rebind writing
	$('#liveWrite').unbind('keyup');
	$('#liveWrite').keyup(keyupLiveWrite);
}

//var SERVER_LOCATION = "//localhost:5000";
var SERVER_LOCATION = "//afternoon-reaches-1117.herokuapp.com";
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

function keyupLiveWrite(e) {
	e.preventDefault();
	var channel = 'anonymous';
	
	if(e.keyCode == 13) { // enter
	
		var textarea = $(this);
	
		var text = textarea.val();
		if (!text || text==false) return;
				
		var message = '<span style="background-color: yellow; font-size: 1em; font-weight: bold;">Official representative: ' + text + '</span>';
		// no secret, firstBool set to false
		socket.emit('send', { message: message, url: $('#activeUrl').val(), channel: channel, firstBool: false });
	
		// clear write field
		textarea.val('');
		// scroll read field to bottom
		textarea.scrollTop(textarea.prop("scrollHeight"));
	}
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
	
	// writing
	$('#liveWrite').keyup(keyupLiveWrite);
});