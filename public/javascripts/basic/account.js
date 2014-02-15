// enables sibling submit button if sibling inputs not blank
function enableNextSubmit(e) {
	e.preventDefault();
	
	// for general case: make sure sibling inputs, if any, are not empty
	var sibs = $(this).siblings('input');
	
	if (sibs.length) {
		for (var i=0; i<sibs.length; i++) {
			if (sibs.get(i).value==false) return false; // 'value' for html object, not jquery
		}
	}
	$(this).siblings('button').removeAttr('disabled');
}

// PUT data for attribute change
// for now two cases: email and password - ! based on [name]
// return a value, so we can check and return outside function
function clickUserButton(e) {
	e.preventDefault();
	
	// make sure alerts are hidden from past
	var error = $(this).siblings('.alert-danger');
	var success = $(this).siblings('.alert-success');
	var loader = $(this).siblings('.loader_wrapper');
	error.hide();
	success.hide();
	
	// if condition == false msg displayed
	function checkFields(danger, condition, msg) {
		if (condition==false) {
			danger.html(msg);
			danger.show();
		}
		return condition;
	};
	function isValidEmailAddress(emailAddress) {
		var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
		return pattern.test(emailAddress);
	};
	
	// data
	var data = {};
	if ($(this).attr('name')=='email') {
		var email = $(this).siblings('input[name="email"]');
		data.email = email.val();
		
		if (checkFields(error, email.val()!='' && isValidEmailAddress(email.val()),'Please provide a valid email')==false) return false;
	} else {
		var oldPass = $(this).siblings('input[name="oldPassword"]');
		var newPass = $(this).siblings('input[name="newPassword"]');
		var confirmPass = $(this).siblings('input[name="confirmPassword"]');
		
		data.oldPassword = oldPass.val();
		data.newPassword = newPass.val();
		// checks
		if (checkFields(error, newPass.val()==confirmPass.val(),'New passwords don\'t match')==false) return false;
		if (checkFields(error, (newPass.val()!='' && confirmPass.val()!='' && oldPass.val()!=''),'Please complete all fields')==false) return false;
	}
	
	// if show too early and fail condition, won't stop showing
	loader.show();

	// PUT
	$.ajax({
		type:		"PUT",
		url:		"/publisher",
		data:		data,
		success:	function() {
			success.html('Change successful');
			success.show();
		},
		error:		function() {
			error.html('Change unsuccessful');
			error.show();
		},
		complete:	function() {
			loader.hide();
		}
	});
}

$(function() {
	$('.userButton').click(clickUserButton);

	// enabling change buttons upon user input
	$('.userInput').keyup(enableNextSubmit);

	// hide or show script with publisher's secret code
	$('#toggleScript').click(function(e) {
		$('#script').toggle();
		$(this).html($(this).html()=='Hide' ? 'Show' : 'Hide');
	});
});