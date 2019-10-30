//Tọa độ nhà thờ Đức Bà - tọa độ mặc định
var _latitude = 10.7797838;
var _longitude = 106.6968061;

var zwTimeInterval = 6000;

//Set time for Interval
if((vconfig != null) || (vconfig != undefined)) {
	zwTimeInterval = vconfig.zwTimeInterval;
}


//Kiễm tra bản đồ có thay đổi không mỗi 0.5s
setInterval(function(){ 
	t0 = getIntCookie("t0");
	var dateObj = new Date();
	t = dateObj.getTime();
	delta = t - t0;		//Khoản cách thời gian

	//Trường hợp delta hơn 6s mà t0 lớn hơn 0
	if((delta > zwTimeInterval) && (t0 != 0)) {
		setCookie("t0", 0);			//Đã sử dụng dữ liệu thay đổi
		
		_lat = getFloatCookie("_lat");
		_lng = getFloatCookie("_lng");
		
		
		keyword = $('#keyword').val();
		address = $('#keyword').val();
		arr_category = $('#category').val();
		
		//Load map dựa vào tọa độ
		callSearch(keyword, address, arr_category,_lat, _lng);
	}
	
}, 
500);

//Kiễm tra bản đồ có thay đổi không mỗi 0.2s
setInterval(function(){ 
	if(bar_key != "") {
		history.replaceState('data to be passed', 'Broswer your location', bar_key);
		bar_key = "";
		
	}
}, 
200);

// Set if language is RTL and load Owl Carousel

$(window).load(function(){
	var rtl = false; // Use RTL
	initializeOwl(rtl);
});

autoComplete();

$('.footer_news_btn').toggle(function() {
	$('.footer_news_btn').toggleClass('toggle');
	$('.footer_news_wrapper').stop().animate({
	    opacity: 1,
	    height: 100
	});
	},function() {
	$('.footer_news_btn').toggleClass('toggle');
	$('.footer_news_wrapper').stop().animate({
	    opacity: 0,
	    height: 0
	});
});

//======= Facebook Pixel Code ST
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '426747954186589'); // Insert your pixel ID here.
fbq('track', 'Search', {
search_string: window.location.search
});
//======= Facebook Pixel Code ED

