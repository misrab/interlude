/*
 *	Internal functions
 */
 
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
// uses loadScript to load styles, socket.io, jquery and jquery-ui
function loadStylesSocketAndJquery(next) {
	// load styles
	loadStyle("http://localhost:3700/index.css", function() {
		// load socket.io
		loadScript("http://localhost:3700/socket.io/socket.io.js", function() {
			// then load jquery
			loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function() {
				// then load jquery-ui
				loadScript("//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js", function() {
					next();
			
					//var socket = io.connect('http://localhost:3700');
				});
			});
		});
	});
}

// This adds the chatbox to the page
function insertInitialHtml(next) {
	$('<div/>', {
		id: 		'interlude-chatBox' //,
		//style:		'position: relative;width: 400px; height: 200px; border: 1px solid black; border-right: none; position: fixed; left: 0; top: 50%; margin-top: -100px;'
	}).appendTo('body');
	
	var chatBox = $('#interlude-chatBox');
	chatBox.draggable();
	//-webkit-transform: rotate(-90deg); 
	// add the tab
	$('<div/>', {
		id:			'interlude-chatBox-tab' //,
		//style:		'right: -40px; top: -1px; padding: 0px 5px; text-align: center; opacity: 0.7; border-top-right-radius: 6px; border-bottom-right-radius: 6px; cursor:pointer; height: 200px; width: 30px; background-color: #C9FFE5; position: absolute; border: 1px solid black;'
	}).appendTo('#interlude-chatBox');
	
	var chatBoxTab = $('#interlude-chatBox-tab');
	chatBoxTab.append('<div id="interlude-chatBox-tab-title", name="title">Interlude Chat</div>');
	
	/*
	chatBoxTab.append('<div id="#interlude-chatBox-tab-title", name="title">Interlude Chat</div>');
	var charBoxTabTitle = chatBoxTab.find('[name="title"]');
	charBoxTabTitle.css('height','30px');
	charBoxTabTitle.css('width','200px');
	charBoxTabTitle.css('position','absolute');
	charBoxTabTitle.css('top','86px');
	charBoxTabTitle.css('left','-74px');
	charBoxTabTitle.css('position','absolute');
	charBoxTabTitle.css('-webkit-transform','rotate(-90deg)');
	*/
	
	chatBoxTab.click(function(e) {
		e.preventDefault();
		var toggleWidth = chatBox.width() == 400 ? "0px" : "400px";
        chatBox.animate({ width: toggleWidth });
	});
}


/*
 *	Window on load
 */
window.onload = function() {

	loadStylesSocketAndJquery(function() {
		insertInitialHtml(function() {
			
		});
	});
	
	
 	
 	
 	/*
 	var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";

	// add socket.io
   	s.src = "http://localhost:3700/socket.io/socket.io.js";
    // Use any selector
    document.getElementsByTagName('head')[0].appendChild(s);
    //$("head").append(s);
    
	 var socket = io.connect('http://localhost:3700');*/
	 /*
	 <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	 <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"></script>
	 */
	 	
 	/*
    var messages = [];
    var socket = io.connect('http://localhost:3700');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });
 
    sendButton.onclick = function() {
        var text = field.value;
        socket.emit('send', { message: text });
    };
 	*/
}