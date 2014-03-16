function switchValue(planTitle) {
	switch(planTitle) {
		case 'starter':
			return '0';
			break;
		case 'premium':
			return '1';
			break;
		case 'enterprise':
			return '2';
			break;
		default:
			return '0';
	};
}

function submitSignupForm(e) {
	e.preventDefault();
	
	var form = $(this);
	var loader = $('.loader_wrapper', form);
	var success = $('.alert-success', form);
	var danger = $('.alert-danger', form);
	success.hide();
	danger.hide();
	
	loader.show();
	
	var data = {};
	data.email = $('[name="email"]', form).val();
	data.password = $('[name="password"]', form).val();
	data.plan = $('[name="plan"]', form).val();
	
	
	
	$.post('/signup', data, function(result) {	
		if (result.success) {
			// enterprise not yet valid
			window.location.replace('/account');
			/*
			var msg = 'Congratulations! Now simply paste the following script into your page: ';
			success.html(msg);
			success.show();
			*/
		} else {
			
			danger.html(success.message);
			danger.show();
		}
		
		// hide loader
		loader.hide();
	});
}

$(function() {	
	// signup
	$('#signupForm').submit(submitSignupForm);

	// select plan
	/*
	$('.plan').click(function(e) {
		e.preventDefault();
		$('.plan').removeClass('active');
		$(this).addClass('active');
		
		// set hidden input in signup form
		var signupHidden = $('[name="plan"]', $('#signupForm'));
		var planTitle = $('.planTitle', $(this)).html().toLowerCase();
		var value = switchValue(planTitle);
		signupHidden.val(value);*/
	});
});