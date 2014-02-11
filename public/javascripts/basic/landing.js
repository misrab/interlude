$(function() {
	var windowh = $(window).height();
	
	var row1h = $('#row1').height();
	var row2h = $('#row2').height();
	
	var newh = windowh - row1h - row2h
	$('.carousel-inner > .item').height(newh);
});