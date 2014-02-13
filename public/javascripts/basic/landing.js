function setHeight() {
	var windowh = $(window).height();
	
	var row0h = $('#row0').height();
	var row1h = $('#row1').height();
	var row2h = $('#row2').height();
	
	var newh = windowh - row0h - row1h - row2h;
	$('.carousel-inner > .item').height(newh);
}

$(function() {
	setHeight();
});