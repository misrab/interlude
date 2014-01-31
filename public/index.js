/*
 *	Internal functions
 */
var SERVER_LOCATION = "http://localhost:5000";
var TAB_POSITION = "tabTop";
// These are set in the function 'insertInitialHtml'
var chatBoxContainer,
	chatBoxTab,
	chatBoxRead,
	chatBoxWrite,
	chatBoxClose;
 
// This function will work cross-browser for loading scripts asynchronously
function loadScript(src, callback) {
  var s,
	  r,
	  t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = src;
  s.onload = s.onreadystatechange = function() {
	//console.log( this.readyState ); //uncomment this line to see which ready states are called.
	if ( !r && (!this.readyState || this.readyState == 'complete') )
	{
	  r = true;
	  callback();
	}
  };
  document.getElementsByTagName('head')[0].appendChild(s);
  //t.parent.insertBefore(s, t);
}
// Analagous but loads style
function loadStyle(src, callback) {
	 var s,
	  r,
	  t;
  r = false;
  s = document.createElement('link');
  s.type = 'text/css';
  s.rel = 'stylesheet';
  s.href = src;

  s.onload = s.onreadystatechange = function() {
	//console.log( this.readyState ); //uncomment this line to see which ready states are called.
	if ( !r && (!this.readyState || this.readyState == 'complete') )
	{
	  r = true;
	  callback();
	}
  };
  document.getElementsByTagName('head')[0].appendChild(s);
}


// NOTE: consider using $.getScript(src, callback) as soon as we have jquery if that is more robust
// uses loadScript to load styles, socket.io, jquery and jquery-ui, jquery-ui style
function loadStylesSocketAndJquery(next) {
	// load styles
	loadStyle(SERVER_LOCATION + "/index.css", function() {
		// load socket.io
		loadScript(SERVER_LOCATION + "/socket.io/socket.io.js", function() {
			// then load jquery
			loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function() {
				// then load jquery-ui
				loadScript("//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js", function() {
					loadStyle("//code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css", function() {
						next();
					});
				});
			});
		});
	});
}



// This adds the chatbox to the page
function insertInitialHtml(next) {

	// First insert the container
	$('<div/>', { id: 'interlude-chatBox-container' }).appendTo('body');
	// Add the tab
	$('<div/>', { 
		id: 	'interlude-chatBox-'+TAB_POSITION,
		// Title with logo
		html:	'<span><img style="width: 16px; height: 16px;" src="'+SERVER_LOCATION+'/images/interlude_logo.png" /> Interlude Chat</span> <span id="interlude-chatBox-close">X</span>'
	}).appendTo('#interlude-chatBox-container');
	
	// Add the read section
	$('<div/>', { 
		id: 	'interlude-chatBox-read',
		html:	'<span style="color: grey;">Welcome to Interlude! Chat with other people surfing this page right now!</span>'
	}).appendTo('#interlude-chatBox-container');
	// Add the write section
	$('<textarea id="interlude-chatBox-write" />').appendTo('#interlude-chatBox-container');
	
	
	// store j-objects as variables
	chatBoxContainer = $('#interlude-chatBox-container');
	chatBoxTab = $('#interlude-chatBox-'+TAB_POSITION);
	chatBoxRead = $('#interlude-chatBox-read');
	chatBoxWrite = $('#interlude-chatBox-write');
	chatBoxClose = $('#interlude-chatBox-close');
	
	// make container draggable and resizable
	chatBoxContainer.draggable();
	chatBoxContainer.resizable();
	
	// make input field inputable
	chatBoxWrite.attr('contenteditable', 'true');
	
	// bind a couple things
	// allow viewer to delete chatbox
	chatBoxClose.click(function(e) { e.preventDefault(); $('#interlude-chatBox-container').remove(); });
	chatBoxTab.click(function(e) {
		e.preventDefault();
		
		var l = $(window).height() - (chatBoxContainer.height() + chatBoxContainer.position().top);
		// Case bottom
		if (l < 0) {
			// make sure these guys visible
			chatBoxRead.slideDown();
			chatBoxWrite.slideDown();
			
			// top and bottom shouldn't contradict each other
			// (dragging may set top)
			chatBoxContainer.css('top', '');
			chatBoxContainer.animate({ bottom: '0px' });
		// we'll stick it back down
		} else if (l < 30) {
			// if dragged to bottom while closed, need to show these guys
			chatBoxRead.slideDown();
			chatBoxWrite.slideDown();
			
			chatBoxContainer.css('top', '');
			chatBoxContainer.animate({ bottom: '-230px' });
		} else {
			chatBoxRead.slideToggle();
			chatBoxWrite.slideToggle();
		}
	
			
		// if container is still stuck to bottom, let's just slide it down
		/*
		var containerBottom = chatBoxContainer.css('bottom');
		if (containerBottom=='-230px') {
			console.log('case1');
			chatBoxContainer.animate({ bottom: '0px' });
		} else if (containerBottom=='0px') {
			console.log('case2');
			chatBoxContainer.animate({ bottom: '-230px' });
		
		// case not at bottom
		} else {
			console.log('case3');
			chatBoxRead.slideToggle();
			chatBoxWrite.slideToggle();
		}*/
	});
	
	next();
}


var messages = [];
function initializeSocket(next) {
	// we only bind sockets now, so save anything to do
	// with that for here onwards
	var socket = io.connect(SERVER_LOCATION);
	
	socket.on('message', function (data) {
		if(data.message) {
			messages.push(data.message);
			var html = '';
			for(var i=0; i<messages.length; i++) {
				html += messages[i] + '<br />';
			}
			
			//$('#interlude-chatBox-read').html(html);
			chatBoxRead.html(html);
		} else {
			console.log("There is a problem:", data);
		}
	});
	
	// bind the write field
	chatBoxWrite.keyup(function(e) {
        if(e.keyCode == 13) { // enter
        	var text = chatBoxWrite.val();
            socket.emit('send', { message: text });
            // clear write field
            chatBoxWrite.val('');
        }
    });
			
			
	next();
}

/*
 *	Window on load
 */
window.onload = function() {
	loadStylesSocketAndJquery(function() {
		insertInitialHtml(function() {
			initializeSocket(function() {
			
			});
		});
	});
}