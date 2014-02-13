function submitLoginForm(e) {
	e.preventDefault();
	
	var form = $(this);
	var loader = $('.loader_wrapper', form);
	loader.show();
	
	var data = {};
	data.email = $('[name="email"]', form).val();
	data.password = $('[name="password"]', form).val();
	
	$.post('/login', data, function(result) {
		var error = $('.alert-danger', form);
		error.hide();
		
		if (result.success) {
			 location.reload();
		} else {
			error.html(result.message);
			error.show();
		}
		
		loader.hide();
	});
}

function clickLogoutButton(e) {
	e.preventDefault();
	
	$.ajax({
		type: 		'DELETE',
		url:		'/logout',
		complete:	function() {
						window.location.replace("/");
					}
	});
};


$(function() {
	$('#loginForm').submit(submitLoginForm);
	$('#logoutButton').click(clickLogoutButton);
});