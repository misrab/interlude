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

$(function() {	
	$('.plan').click(function(e) {
		e.preventDefault();
		$('.plan').removeClass('active');
		$(this).addClass('active');
		
		// set hidden input in signup form
		var signupHidden = $('[name="plan"]', $('#signupForm'));
		var planTitle = $('.planTitle', $(this)).html().toLowerCase();
		var value = switchValue(planTitle);
		signupHidden.val(value);
	});
});