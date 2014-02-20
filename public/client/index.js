/*
 *	Internal functions and variables
 */
var interludeInternalObject = {

	/*
	 *	 Internal Variables
	 */
	SERVER_LOCATION:		"//afternoon-reaches-1117.herokuapp.com",
	//SERVER_LOCATION: 		"//localhost:5000",
	TAB_POSITION: 			"tabTop",
	
	// These are set in the function 'insertInitialHtml'
	chatBoxContainer:		null,
	chatBoxTab:				null,
	chatBoxLogistics:		null,
	chatBoxRead:			null,
	chatBoxWrite:			null,
	chatBoxClose:			null,
	
	secret:					null,
	socket:					null,
	url:					'',
	
	userstring:				'',
	firstBool:				true,
	messages:				[],
	usernames: 				['Apple','Orange','Pear','Guava','Apricot','Plum'],
	
	
	/*
	 *	Misc. internal functions
	 */

	/**
	 * Returns a random integer between min and max
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	getRandomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	get_random_color: function() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.round(Math.random() * 15)];
		}
		return color;
	},
	
	// This function will work cross-browser for loading scripts asynchronously
	loadScript:	function(src, callback) {
	  var s, r, t;
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
	},
	
	// Analagous but loads style
	loadStyle:	function(src, callback) {
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
	},
	
	
	/*
	 *	Internal Functions
	 */

	// NOTE: consider using $.getScript(src, callback) as soon as we have jquery if that is more robust
	// uses loadScript to load styles, socket.io, jquery and jquery-ui, jquery-ui style
	loadStylesSocketAndJquery: function(next) {
		// load styles
		interludeInternalObject.loadStyle(interludeInternalObject.SERVER_LOCATION + "/client/index.css", function() {
			// load socket.io
			interludeInternalObject.loadScript(interludeInternalObject.SERVER_LOCATION + "/socket.io/socket.io.js", function() {
				// then load jquery
				interludeInternalObject.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function() {
					// then load jquery-ui
					interludeInternalObject.loadScript("//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js", function() {
						interludeInternalObject.loadStyle("//code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css", function() {
							next();
						});
					});
				});
			});
		});
	},
	
	// for binding to chat tab for chatbox opening and closing
	clickChatBoxTab:	function(e) {
		e.preventDefault();
	
		var l = $(window).height() - (interludeInternalObject.chatBoxContainer.height() + interludeInternalObject.chatBoxContainer.position().top);
		// Case bottom
		if (l < 0) {
			// make sure these guys visible
			interludeInternalObject.chatBoxRead.slideDown();
			interludeInternalObject.chatBoxWrite.slideDown();
			interludeInternalObject.chatBoxLogistics.slideDown();
		
			// top and bottom shouldn't contradict each other
			// (dragging may set top)
			interludeInternalObject.chatBoxContainer.css('top', '');
			interludeInternalObject.chatBoxContainer.animate({ bottom: '0px' });
		// we'll stick it back down
		} else if (l < 30) {
			// if dragged to bottom while closed, need to show these guys
			interludeInternalObject.chatBoxRead.slideDown();
			interludeInternalObject.chatBoxWrite.slideDown();
			interludeInternalObject.chatBoxLogistics.slideDown();
		
			interludeInternalObject.chatBoxContainer.css('top', '');
			var paddingTop = parseInt(interludeInternalObject.chatBoxTab.css('padding-top')); // padding for tab
			interludeInternalObject.chatBoxContainer.animate({ bottom: '-'+(interludeInternalObject.chatBoxContainer.height() - interludeInternalObject.chatBoxTab.height() - 2*paddingTop)+'px' });
		} else {
			interludeInternalObject.chatBoxRead.slideToggle();
			interludeInternalObject.chatBoxWrite.slideToggle();
			interludeInternalObject.chatBoxLogistics.slideToggle();
		}
	},
	
	changeChatBoxRadio: function(e) {	
	
		//e.preventDefault(); we want default! i.e. radio selection
		// Case 1: Anonymous
		if ($(this).val() == 'anonymous') {
			// remove other listeners
			interludeInternalObject.socket.removeAllListeners('message-'+interludeInternalObject.url+'-login');
			// make sure this listener on
			interludeInternalObject.socketListen('anonymous');
			
			// make sure writing is enabled, don't double-bind
			interludeInternalObject.chatBoxWrite.unbind('keyup');
			interludeInternalObject.chatBoxWrite.keyup(interludeInternalObject.keyupChatBoxWriteAnonymous);
			interludeInternalObject.chatBoxWrite.removeAttr('readonly');
			
			// listen to anonymous
		} else {
			// trigger facebook
			//$.get(interludeInternalObject.SERVER_LOCATION+'/auth/facebook');
		
		
			// remove other listeners
			interludeInternalObject.socket.removeAllListeners('message-'+interludeInternalObject.url+'-anonymous');
			// make sure this listener on
			interludeInternalObject.socketListen('login');

			// disable submission first
			interludeInternalObject.chatBoxWrite.unbind('keyup');
			interludeInternalObject.chatBoxWrite.attr('readonly', 'readonly');
		
			// fb login
			
			// listen to login-ed chat
		}
	},
	
	keyupChatBoxWriteAnonymous: function(e) {
		interludeInternalObject.keyupChatBoxWrite(e, 'anonymous');
	},
	keyupChatBoxWriteLogin: function(e) {
		interludeInternalObject.keyupChatBoxWrite(e, 'login');
	},
	
	
	// binds except for writing, which waits for socket.io
	bindChatbox: function() {
		// make container draggable and resizable
		interludeInternalObject.chatBoxContainer.draggable();
		interludeInternalObject.chatBoxContainer.resizable();
	
		// make input field inputable
		interludeInternalObject.chatBoxWrite.attr('contenteditable', 'true');
	
		// allow viewer to delete chatbox
		interludeInternalObject.chatBoxClose.click(function(e) { e.preventDefault(); $('#interlude-chatBox-container').remove(); });
		
		// tab opening and closing of chatbox
		interludeInternalObject.chatBoxTab.click(interludeInternalObject.clickChatBoxTab);
		
		// radio selection anonymous vs logged in
		//$('input[type="radio"][name="group1"]', interludeInternalObject.chatBoxContainer).change(interludeInternalObject.changeChatBoxRadio);
	},

	// This adds the chatbox to the page
	insertInitialHtml: function(next) {

		// First insert the container
		$('<div/>', { id: 'interlude-chatBox-container' }).appendTo('body');
		
		// Add the tab
		$('<div/>', { 
			id: 	'interlude-chatBox-'+interludeInternalObject.TAB_POSITION,
			// Title with logo
			html:	'<span><img style="width: 16px; height: 16px;" src="'+interludeInternalObject.SERVER_LOCATION+'/images/interlude_logo.png" /> Interlude Chat</span> <span id="interlude-chatBox-close">X</span>'
		}).appendTo('#interlude-chatBox-container');
		
		// Add the logistics section
		/*
		$('<div/>', { 
			id: 	'interlude-chatBox-logistics',
			html:	'<input style="margin: 0 10px;" name="group1" checked value="anonymous" type="radio">Anonymous</input><input style="margin: 0 10px;" value="login" name="group1" type="radio">Login with Facebook</input>'
		}).appendTo('#interlude-chatBox-container');
		*/
		
		// Add the read section
		var readHtml =  '<span style="color: grey;">Welcome to '
						+ '<a href="'+interludeInternalObject.SERVER_LOCATION+'/about" target="_blank">Interlude</a>! Chat with other people surfing this page right now!</span>';
		$('<div/>', { 
			id: 	'interlude-chatBox-read',
			html:	readHtml
		}).appendTo('#interlude-chatBox-container');
		
		// Add the write section
		$('<textarea id="interlude-chatBox-write" />').appendTo('#interlude-chatBox-container');
	
		// store j-objects as variables
		interludeInternalObject.chatBoxContainer = $('#interlude-chatBox-container');
		interludeInternalObject.chatBoxTab = $('#interlude-chatBox-'+interludeInternalObject.TAB_POSITION);
		interludeInternalObject.chatBoxLogistics = $('#interlude-chatBox-logistics');
		interludeInternalObject.chatBoxRead = $('#interlude-chatBox-read');
		interludeInternalObject.chatBoxWrite = $('#interlude-chatBox-write');
		interludeInternalObject.chatBoxClose = $('#interlude-chatBox-close');
		
		// bind elements in the chatbox
		interludeInternalObject.bindChatbox();
		
		next();
	},
	
	// slave to keyupChatBoxWrite[Anonymous|Login]
	keyupChatBoxWrite: function(e, channel) {
		if(e.keyCode == 13) { // enter
			var text = interludeInternalObject.chatBoxWrite.val();
			if (!text || text==false) return;
			
			interludeInternalObject.socket.emit('send', { message: interludeInternalObject.userstring + text, url: interludeInternalObject.url, channel: channel, secret: interludeInternalObject.secret, firstBool: interludeInternalObject.firstBool });
			// change firstBool if appropriate - AFTER first emit!
			if (interludeInternalObject.firstBool) interludeInternalObject.firstBool = false;
			
			// clear write field
			interludeInternalObject.chatBoxWrite.val('');
			// scroll read field to bottom
			interludeInternalObject.chatBoxRead.scrollTop(interludeInternalObject.chatBoxRead.prop("scrollHeight"));
		}
	},
	
	// listens for socket on given channel: 'anonymous' or 'login'
	socketListen:	function(channel) {
		interludeInternalObject.socket.on('message-'+interludeInternalObject.url+'-'+channel, function (data) {		
		
			if (data.message) {
				interludeInternalObject.messages.push(data.message);
				var html = '';
				for(var i=0; i<interludeInternalObject.messages.length; i++) {
					html += interludeInternalObject.messages[i] + '<br />';
				}
			
				interludeInternalObject.chatBoxRead.html(html);
				
				// scroll read field to bottom
				interludeInternalObject.chatBoxRead.scrollTop(interludeInternalObject.chatBoxRead.prop("scrollHeight"));
			} else {
				console.log("There is a problem:", data);
			}
		});
	},

	initializeSocket:	function(next) {
		// we only bind sockets now, so save anything to do
		// with that for here onwards
		interludeInternalObject.socket = io.connect(interludeInternalObject.SERVER_LOCATION);
			
		// get the url - all chat for this url will be on this url
		// ! may want to make this more secure
		interludeInternalObject.url = $(location).attr('href'); //window.location.pathname;
	
		// generate a random-ish username here
		var username = interludeInternalObject.usernames[interludeInternalObject.getRandomInt(0, interludeInternalObject.usernames.length-1)] + interludeInternalObject.getRandomInt (0, 9999);
		interludeInternalObject.userstring = '<span style="font-weight: bold; color: '+interludeInternalObject.get_random_color()+';">'+username+': </span>';
		
		
		// now listen to messages for this url
		interludeInternalObject.socketListen('anonymous');
		
		// bind the write field
		// send messages to list for this url
		// ! this will use the interludeInternalObject.secret
		interludeInternalObject.chatBoxWrite.keyup(interludeInternalObject.keyupChatBoxWriteAnonymous);

		next();
	},
	
	masterFunction: function(code, cb) {
		// set the code global
		interludeInternalObject.secret = code;
		
		
		interludeInternalObject.loadStylesSocketAndJquery(function() {
			interludeInternalObject.insertInitialHtml(function() {
				interludeInternalObject.initializeSocket(function() {
					
					if (cb) cb(); // callback from masterFunction if any
				});
			});
		});
	}
}
// end of interludeInternalObject




/*
 *	Window on load
 */
 
/*
window.onload = function() {
	
}*/