//Tọa độ nhà thờ Đức Bà - tọa độ mặc định
var _latitude = 10.7797838;
var _longitude = 106.6968061;
var zmTimeInterval = 6000;

//Set time for Interval
if((vconfig != null) || (vconfig != undefined)) {
	zmTimeInterval = vconfig.zmTimeInterval;
}

//Kiễm tra bản đồ có thay đổi không mỗi 0.5s
setInterval(function(){ 
	t0 = getIntCookie("t0");
	var dateObj = new Date();
	t = dateObj.getTime();
	delta = t - t0;		//Khoản cách thời gian

	//Trường hợp delta hơn 6s mà t0 lớn hơn 0
	if((delta > zmTimeInterval) && (t0 != 0)) {
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

// Set if language is RTL and load Owl Carousel

$(window).load(function(){
	var rtl = false; // Use RTL
	initializeOwl(rtl);
});

autoComplete();