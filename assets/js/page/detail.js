$(window).load(function(){
	var rtl = false; // Use RTL
	initializeOwl(rtl);
});

	
	 
 $(function(){
	var rtl = false; // Use RTL
	initializeOwl(rtl);
	
	jssor_1_slider_init();

});

$(document).on('ready', function() {
	$("#upload").fileinput({
		showUpload: false,
		showCaption: false,
		browseClass: "btn btn-primary btn-lg",
		fileType: "any",
		browseLabel: "Tải hình ảnh",
		previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
		allowedFileExtensions: ["jpg", "png", "gif"]
	});

});

//======= Facebook Pixel Code ST
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '426747954186589'); // Insert your pixel ID here.
fbq('track', 'Detail', {
search_string: window.location.search
});
//======= Facebook Pixel Code ED


$(".modal-transparent").on('show.bs.modal', function () {
  setTimeout( function() {
    $(".modal-backdrop").addClass("modal-backdrop-transparent");
  }, 0);
});
$(".modal-transparent").on('hidden.bs.modal', function () {
  $(".modal-backdrop").addClass("modal-backdrop-transparent");
});

$(".modal-fullscreen").on('show.bs.modal', function () {
  setTimeout( function() {
    /*$(".modal-backdrop").addClass("modal-backdrop-fullscreen");
	var iframe = document.getElementById("frmDirection");
	iframe.src = "direction4.html?_lat=10.796364&_lng=106.645655";*/
  }, 0);
});
$(".modal-fullscreen").on('hidden.bs.modal', function () {
  $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
  var iframe = document.getElementById("frmDirection");
	iframe.src = "about:blank";
});