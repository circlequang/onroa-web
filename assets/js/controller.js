var mainApp = angular.module("mainApp", ['ui.router', 'ngSanitize']);
var uid = '';
var tuid = '';
var detailData = null;
var bar_lat = 0;
var bar_lng = 0;
var bar_key = "";

function getFloat(_val) {
	val = parseFloat(_val);
   if (isNaN(val)) {
     return 0;
   }
   
   return val;
}

function getInt(_val) {
	val = parseInt(_val);
   if (isNaN(val)) {
     return 0;
   }
   
   return val;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function setCookie(cname, cvalue) {
	var now = new Date();
	var time = now.getTime() + 3600 * 1000;
	now.setTime(time);
    document.cookie = cname + "=" + cvalue.toString() + '; expires=' + now.toUTCString();
}

function getFloatCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
			val = getFloat(c.substring(name.length, c.length));
            return val;
        }
    }
    return 0;
}

function getIntCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
			val = getInt(c.substring(name.length, c.length));
            return val;
        }
    }
    return 0;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function fbconnect(page, userID, accessToken, csrf) {
	//Gọi service để login vào hệ thống
	$.ajax({ 
		//async: false,
		cache: false,
		data: {
			fb_id: userID, 
			token: accessToken,
			csrf: csrf
		  },
		url: 'service.php?sv=user&f=fb_login',
		type: "POST",
		//processData: false,
		success: function(jsonText, textStatus, jqXHR) {
			result  = JSON.parse(jsonText);
			if(result.uid.length > 5) {
				window.localStorage.setItem('uid', result.uid);
				//window.location.href = "profile.html";
				pathname = window.location.pathname;
				if((pathname.search('signin.html') > 0) || (pathname.search('lostpass.html') > 0) || (pathname.search('register.html') > 0)){
					window.location = 'profile.html';
					return;
					} else {
					location.reload();
				}
				
			} else {
				window.localStorage.setItem('uid', "");
				swal("Không thực hiện được lúc này");
			}
		},
		error: function(ex) {
			swal("Không truy xuất được hệ thống");
			return null;
		}
	});
}

function fblogin(page) {
    FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			fbconnect(page, response.authResponse.userID, response.authResponse.accessToken, vscope.csrf);
			
		} else {
			FB.login(function(response) {
				if (response.authResponse) {
					fbconnect(page, response.authResponse.userID, response.authResponse.accessToken, vscope.csrf);
				}
				else {
					 swal("Không thể kết nối với Facebook", "Thông báo");
				}
			});
		}
    });
  }

  window.fbAsyncInit = function() {
	  FB.init({
		appId      : '1286728268051325',
		cookie     : true,  // enable cookies to allow the server to access 
							// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.8' // use graph api version 2.8
	  });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

function rad2deg (angle) {
  //  discuss at: http://locutus.io/php/rad2deg/
  // original by: Enrique Gonzalez
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: rad2deg(3.141592653589793)
  //   returns 1: 180
  return angle * 57.29577951308232 // angle / Math.PI * 180
}

function deg2rad (angle) {
    // http://jsphp.co/jsphp/fn/view/deg2rad
    // + original by: Enrique Gonzalez
    // * example 1: deg2rad(45);
    // * returns 1: 0.7853981633974483
    return (angle / 180) * Math.PI;
}

//Lấy khoản cách 2 điểm trên bản đồ
function getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2) {
	theta = longitude1 - longitude2;
    miles = (Math.sin(deg2rad(latitude1)) * Math.sin(deg2rad(latitude2))) + (Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * Math.cos(deg2rad(theta)));
    miles = Math.acos(miles);
    miles = rad2deg(miles);
    miles = miles * 60 * 1.1515;
    kilometers = miles * 1.609344;

    return kilometers;
}

function lockScrent() {
	$("#loading-overlay").show();
	$("#loading-message").show();
}

function unLockScrent() {
	$("#loading-overlay").hide();
	$("#loading-message").hide();
}

//Dựa vào tham số đầu vào, nếu có Address thì dựa vào Address lấy tọa độ cần tìm
function doSearch(key, address, arr_cata, _lat, _lng) {
	if((_lat == 0) && (_lng == 0)){
		_lat = getFloatCookie("_lat");
		_lng = getFloatCookie("_lng");
	}
	//_lat = Math.floor( _lat * 1000);
	//_lng = Math.floor( _lng * 1000);
	//Trường hợp có địa chỉ
	if(address.length > 0) {
		$.getJSON('https://maps.google.com/maps/api/geocode/json?address=' + address, function(data) {
			_lat = getFloatCookie("_lat");
			_lng = getFloatCookie("_lng");
			if(data.status == 'OK') {
				_lat = data.results[0].geometry.location.lat;
				_lng = data.results[0].geometry.location.lng;	
			}
			
			callSearch(key, address, arr_cata, _lat, _lng);
			
		});
	} else { //Trường hợp không có địa chỉ
		//Test
		callSearch(key, address, arr_cata, _lat, _lng);
		
	}
};

function callSearch(key, address, arr_cata, _latitude, _longitude) {
	//Gọi service để load data vào hệ thống
	
	//Lấy lat/lng hiện tại làm tâm tìm kiếm
	_lat = Math.floor( _latitude * 1000);
	_lng = Math.floor( _longitude * 1000);
	cata = "";
	
	if((arr_cata == undefined) || (arr_cata == null)) l = 0;
	else 	l = arr_cata.length;
	
	for(i = 0; i < l; i++) {
		if(cata.length > 0) {
			cata = cata + "," + arr_cata[i];
		} else {
			cata = arr_cata[i];
		}
	}
	url_query = 'service.php?sv=point&f=search&key=' + key + '&address=' + address +'&cata=' + cata + '&_lat=' + _lat + "&_lng=" + _lng;
	
	//Trường hợp là vào từ mobile, dùng bsearch
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		 url_query = 'service.php?sv=point&f=bsearch&key=' + key + '&address=' + address +'&cata=' + cata + '&_lat=' + _lat + "&_lng=" + _lng;
	}
	
	
	//Call search
	$scope = 
	$.ajax({ 
		async: false,
		cache: false,                                
		url: url_query,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			result  = JSON.parse(jsonText);
			//angular.element(document.getElementById('indexCtrl')).scope().csrf = result.csrf;
			//angular.element(document.getElementById('indexCtrl')).scope().uid =  result.uid;
			//angular.element(document.getElementById('indexCtrl')).scope().data =  JSON.parse(result.data);
			window.localStorage.setItem('result_data', result.data);	//Lưu kết quả vào localStorage
			text = '{ "data" : []}';
			obj = JSON.parse(text);
			obj.data = JSON.parse(result.data); //angular.element(document.getElementById('indexCtrl')).scope().data;
			
			
			setCookie("_lat", _latitude);
			setCookie("_lng", _longitude);
			setCookie("t0", 0);						
			
			createHomepageGoogleMap(_latitude,_longitude,obj);
			
			//Change URL Bar
			/*
			history.pushState('data to be passed', 'Broswer your location', 'https://onroa.com/index.html?key=' + key + '&location=' + address +'&cata=' + cata + '&_lat=' + _lat + '&_lng=' + _lng);
			
			history.replaceState('data to be passed', 'Broswer your location', 'https://onroa.com/index.html?key=' + key + '&location=' + address +'&cata=' + cata + '&_lat=' + _lat + '&_lng=' + _lng);
			*/
			bar_key = 'https://onroa.com/index.html?key=' + key + '&location=' + address +'&cata=' + cata + '&_lat=' + _latitude + '&_lng=' + _longitude;
			
			if(obj.data.length == 0) {
				swal('Không tìm được địa điểm thích hợp', 'Thông báo');
			}
			
			if(obj.data[0] == 'y') {
				obj.data.splice(0, 1);
				jConfirm('Không có kết quả ở bản đồ này nhưng có ở bản đồ khác, bạn có muốn xem?', 'Xác nhận',function(r){
					if(r == true) {
						url = 'listsearch.html?key=' + key + '&address=' + address +'&cata=' + cata + '&_lat=' + _lat + "&_lng=" + _lng;
						window.location = url;
					}
				});
			}
			
		},
		error: function() {
			swal('Không truy xuất được hệ thống');
		}
	});
}

/*
	Set giá trị backToIndexURL, dùng khi quay về Index thì kh cần lên server lấy data
*/
function backToIndex() {
	search_query = window.localStorage.getItem('search_query');
	
	if(search_query == undefined || search_query == null) {
		window.location = 'index.html';
		return;
	}
	
	//Trường hợp cookie kg lưu tọa độ => nhảy về index.html
	_lat = getFloatCookie("_lat");		//Lấy các giá trị này từ cookie
	_lng = getFloatCookie("_lng");		//Lấy các giá trị này từ cookie
	if(_lat == 0 || _lng == 0) {
		window.location = 'index.html';
		return;
	}

	//Lấy chuổi url-query từ trang index, thêm dòng [back=y]
	if(search_query.length > 0) search_query = search_query + "&";
	search_query = search_query + "back=y";
	window.location = 'index.html?' + search_query;
}



//Thiết lập các giá trị đầu tiên cho page
var vscope = null;
var vconfig = null;
function setInitValue($scope) {
	//Lấy tọa độ hiện tại
	if(getFloatCookie("_lat") == 0) {
		//Nhà thờ Đức Bà
		_latitude = 10.7797838;
		_longitude = 106.6968061; 
	} else {
		_latitude = getFloatCookie("_lat");
		_longitude = getFloatCookie("_lng"); 
	}
	
	query = "&key=bdhs92dfGY30s9M2" + MD5("bdlas") + "r3uSoR9uHbdnde3";
	//Trường hợp không phải chạy từ file index
	if((window.location.pathname != '/') && (window.location.pathname.search('index.html') < 0) && (window.location.pathname.search('detail.html') < 0)) {
		query = query + "&_lat=" + _latitude + '&_lng=' + _longitude + '&near=y';
	}
	
	//Gọi service để load data vào hệ thống
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=page&f=init' + query,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			result  = JSON.parse(jsonText);
			$scope.uid = result['uid'];
			$scope.csrf = result['csrf'];
			uid = result['uid'];
			$scope.config = JSON.parse(result['data']);
			vconfig = JSON.parse(result['data']);
			vscope = $scope;
			if(($scope.config['nearPoints'] != undefined) || ($scope.config['nearPoints'] != null)) {
				$scope.nearPoints = $scope.config['nearPoints'];
			}
			return result;
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
			return null;
		}
	});
	return null;
}

function searchSubmit() {
	lat = map.getCenter().lat();
	lng = map.getCenter().lng();
	keyword = $('#keyword').val();
	address = $('#location').val();
	arr_category = $('#category').val();
	
	doSearch(keyword, address, arr_category, lat, lng);
	//return false;
};


/*
	Được gọi ở đầu mỗi page để setup hẹ thống 
*/
function init($scope) {
	setInitValue($scope);
}

function logout() {
	//Gọi service để load data vào hệ thống
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=user&f=logout',
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			if(jsonText == '1') {
				//Nếu đây là trang profile +. quay về index
				if(window.location.pathname.search('profile.html') > 0) window.location = 'index.html';
				location.reload();
			}
			return false;
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
			return false;
		}
	});
	return false;
}

function loadCategory() {
	//Gọi service load category
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=page&f=loadCategory',
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			result  = JSON.parse(jsonText);
			categoryHtml = document.getElementById('category');
			for (var i = 0; i< result.length; i++){
				var opt = document.createElement('option');
				opt.value = result[i].category_id;
				opt.innerHTML = result[i].category_name.vi;
				categoryHtml.appendChild(opt);
			}
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
			return null;
		}
	});

}

mainApp.controller("indexCtrl", function($scope, $location) {
	$scope.myClass = [];
	$scope.config = init($scope);

	search =  window.location.search;
	lockScrent();	// Lock màn hình
	//Trường hợp url có parametar (forward từ trang detail sang)
	keyword = "";
	address = "";
	arr_category = null;
	
	//Trường hợp không chọn catalogue, set default là 1 và 5
	if(search.length == 0) search = '?cata=1,5';
	
	//Load data của category và select box
	loadCategory();
	
	//Trường hợp có nhập chuổi search
	if(search.length > 0) {
		search = search.substring(1);		//Cắt bỏ ký tự ?
		
		//Lưu chuổi query trên URL lại, nếu chuổi query có dòng thì bỏ  dòng này đi
		window.localStorage.setItem('search_query', search.replace("&back=y", ""));	//Lưu chuổi query trên URL
		obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		
		if(obj._lat != undefined) {
			//bar_lat = obj._lat
			setCookie("_lat", obj._lat);
			setCookie("_plat", obj._lat);
		}
		
		if(obj._lng != undefined) {
			//bar_lng = obj._lng;
			setCookie("_lng", obj._lng);
			setCookie("_plng", obj._lng);
		}
		
		if(obj.key != undefined) {
			keyword = obj.key;
			$("#keyword").val(keyword);
		}
			
		if(obj.location != undefined) {
			address = obj.location;
			$("#location").val(address);
		}
		
		if((obj.cata == undefined) || (obj.cata == '')) obj.cata = '1,5';
			
		if(obj.cata != undefined)  {
			str = obj.cata + "";
			str = str.replace(" ","");
			arr_category = str.split(',');
			categoryHtml = document.getElementById( 'category' );
			l = categoryHtml.options.length;
			for ( var i = 0; i < l; i++ )
			{
				o = categoryHtml.options[i];
				if ( arr_category.indexOf( o.value ) != -1 ) {
					o.selected = true;
				}
			}
		}
		
		//Trường hơp data được lưu trong localStorage thì lấy data này lên và show ra map
		//Dùng trong trường hợp back về từ các trang detail/... thig kg cần lên server load về
		if(obj.back != undefined)  {
			try {
				result_data = window.localStorage.getItem('result_data');
				_lat = getFloatCookie("_lat");		//Lấy các giá trị này từ cookie
				_lng = getFloatCookie("_lng");		//Lấy các giá trị này từ cookie
				//Trường hợp localStorage có data và giá trị back = [y]
				if((result_data.length > 10) && (obj.back == 'y') && (_lat !=0) && (_lng != 0) ){
					text = '{ "data" : []}';
					obj = JSON.parse(text);
					obj.data = JSON.parse(result_data);
					
					setCookie("t0", 0);						
				
					createHomepageGoogleMap(_lat,_lng,obj);
					return; //Dừng tại đây khi load map hoàn tất
				}
			}
			catch(err) {}
		}
	}
	//Trường hợp chuổi search rổng,
	//Set category là mặc định 1,5
	else  {
		str = "1,5";
		arr_category = str.split(',');
		categoryHtml = document.getElementById( 'category' );
		l = categoryHtml.options.length;
		for ( var i = 0; i < l; i++ )
		{
			o = categoryHtml.options[i];
			if ( arr_category.indexOf( o.value ) != -1 ) {
				o.selected = true;
			}
		}
	}
	
	//Trường hợp chưa có toa độ trong cookie
	if(getFloatCookie("_lat") == 0) {
		if (navigator.geolocation) {
				var options = {
				  maximumAge: 6000,
				  timeout: 3000,
				  enableHighAccuracy: true,
			   };
		   
				var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

				function onSuccess(position) {

					_latitude = position.coords.latitude;
					_longitude = position.coords.longitude;
					t0 = getIntCookie("t0");
					var dateObj = new Date();
					t = dateObj.getTime();
					//Tọa đổ làm cơ sở lấy vị trí hiện tại
					setCookie("_plat", _latitude);
					setCookie("_plng", _longitude);
					
					//Tọa độ dùng tính toán
					setCookie("_lat", _latitude);
					setCookie("_lng", _longitude);
					setCookie("t0", t);						//Cờ t0 != 0 cho biết tọa độ đã thay đổi
					doSearch(keyword, address, arr_category, _latitude, _longitude);
				};

			   function onError(error) {
					//Tọa độ nhà thờ Đức Bà - tọa độ mặc định
					swal("Không xác định được tọa độ hiện tại của bạn, xin vui lòng kiễm tra GPS");
					_latitude = 10.7797838;
					_longitude = 106.6968061; 
					setCookie("_lat", _latitude);
					setCookie("_lng", _longitude);
					doSearch(keyword, address, arr_category, _latitude, _longitude);
			   }
		} 
		//Không lấy được geo data thì dùng tọa độ mặc định là nhà thờ Đức Bà
		else {
			swal("Không xác định được tọa độ hiện tại của bạn, xin vui lòng bật GPS");
			_latitude = 10.7797838;
			_longitude = 106.6968061; 
			setCookie("_lat", _latitude);
			setCookie("_lng", _longitude);
			doSearch(keyword, address, arr_category, _latitude, _longitude);
		}
	} 
	//Lấy tọa độ trong cookie để tính
	else {
		_lat = getFloatCookie("_lat");
		_lng = getFloatCookie("_lng");
		doSearch(keyword, address, arr_category, _lat, _lng);
	}

	unLockScrent();	// Unlock màn hình khi thao cập nhật dữ liệu xong

	
	$scope.searchSubmit =  function() {
		lat = map.getCenter().lat();
		lng = map.getCenter().lng();
		keyword = $('#keyword').val();
		address = $('#location').val();
		arr_category = $('#category').val();
		
		doSearch(keyword, address, arr_category, lat, lng);
		
		return true;
	};
	
	$scope.mapReload =  function(_lat, _lng) {
		keyword = $('#keyword').val();
		address = $('#location').val();
		category = $('#category').val();
		
		//$scope.doSearch(keyword, address, category,0,0);
		callSearch(key, address, cata, _lat, _lng);
	};

 });

function getGooRef(gooRef) {
	 query = "https://maps.googleapis.com/maps/api/place/details/json?reference=" + gooRef + "&key=AIzaSyC6hGTAkD_Snhx1Aj0kATrn_Pd4t5QibhI";
	gReviews = null;
	$.ajax({ 
	async: false,
	cache: false,                                
	url: query,
	type: "GET",
		success: function(data, textStatus, jqXHR) {
			//Trường hợp có data
			if(data.result.reviews[0] != undefined) {
				gReviews = data.result.reviews;
			} 
		},
		error: function(ex) {
			gReviews = null;
		}
	});
	
	return gReviews;
}

function getGooGetRef(_lat, _lng, title) {
	//Bỏ dấu [-] trong title, nếu có
	title = data.detail.title.split("-");
	title = title[0].replace(" ", "+").trim();
	query = "https://maps.googleapis.com/maps/api/place/search/json?location=" + _lat + "," + _lng + "&radius=500&name=" + title + "&key=AIzaSyC6hGTAkD_Snhx1Aj0kATrn_Pd4t5QibhI";
	gReference = "";
	$.ajax({ 
	async: false,
	cache: false,                                
	url: query,
	type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			//Trường hợp có data
			if(jsonText.results[0] != undefined) {
				gData = jsonText.results[0];
				if(gData.reference  != undefined) {
					gReference = gData.reference;
				}
			}
			
		},
		error: function(ex) {
			gReference = "";
		}
	});
	
	return gReference;
}
 
 
 mainApp.controller("detailCtrl", function($scope, $state, $sce) {
	$scope.myClass = [];
	$scope.config = init($scope);
	query = 'url=' + window.location.search.substring(1).replace("url=","");
	lockScrent();
	//Gọi service để load data vào hệ thống
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=point&f=detail&' + query,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			var result  = JSON.parse(jsonText);
			$scope.csrf = result.csrf;
			$scope.uid =  result.uid;
			data = JSON.parse(result.data);
			//Cập nhật display_name và avatar
			l = data.detail.review.length;
			k = data.user_list.length;
			for(i = 0; i < l; i++) {
				for(j = 0; j < k; j++) {
					if(data.detail.review[i].uid == data.user_list[j]._id) { 
						data.detail.review[i].display_name = data.user_list[j]['display_name'];
						data.detail.review[i].avatar = data.user_list[j]['avatar'];
						if((data.user_list[j].slug != undefined) && (data.user_list[j].slug != null) && (data.user_list[j].slug != ""))
							data.detail.review[i].burl = data.user_list[j].slug;
						else
							data.detail.review[i].burl = data.user_list[j]._id;
					}
				}
			}
			
			//Tìm kiếm points review============================ ST
			
			//Chỉ lấy thêm Google review khi review điểm này ít hơn 5
			if(data.detail.review.length <= 5) {
				//Trường hợp có google reference và cache-time còn trong 30 ngày
				if(data.detail.goo_ref != undefined) {
					expTime = data.detail.goo_cache_time + 30 * 86400;
					currentTime = (new Date().getTime())/1000;
					
					//Trường hợp đã hết hạng, load review mới
					if(expTime >= currentTime) {
					}
				}
				//Trường hợp chưa có goo_ref
				else {
					//Lấy Ref
					gooRef = getGooGetRef(data.detail.latitude, data.detail.longitude, data.detail.title);
					
					//Nếu Ref tồn tại, lấy review
					if(gooRef != "") {
						gooReviews = getGooRef(gooRef);
						if(gooReviews != undefined) {
							gItem = null;
							//Add google review vào Onroa
							for(i = 0; i < gooReviews.length; i++) {
								gItem = {
									review_id: "g" + gooReviews[i].time,
									uid: "g" + gooReviews[i].time,
									display_name: gooReviews[i].author_name,
									burl: "",
									avatar: gooReviews[i].profile_photo_url,
									submit_date: gooReviews[i].time,
									cmt: gooReviews[i].text
								};
								data.detail.review.push(gItem);
							}
						}
					}
				}
			}
			
			//Tìm kiếm points review============================ ED

			$scope.data =  data['detail'];
			detailData = data['detail'];
			$scope.nearPoints =  JSON.parse(data['near']);
			itemDetailMap($scope.data);
			if($scope.data.length == 0) {
				//Xử lý khi không có data
			} 
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
		}

	});

	unLockScrent();

	//Hiển thị khoản cách
	if (navigator.geolocation) {
			//Trường hợp là vào iPhone và vài dong máy khác 
			_maximumAge = 6000;
			if( /Safari|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				 _maximumAge = 1;
			}
			var options = {
			  maximumAge: _maximumAge,
			  timeout: 3000,
			  enableHighAccuracy: true,
		   };
	   
			var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

			function onSuccess(position) {
				_latitude = position.coords.latitude;
				_longitude = position.coords.longitude;
				
				km = getDistanceBetweenPoints(_latitude, _longitude, detailData['latitude'], detailData['longitude']);
				km = km.toFixed(2);

				document.getElementById("DistanceBetweenPoints").innerHTML= km + " km";

				if(km < 1) {
					metes = km*1000;
					document.getElementById("DistanceBetweenPoints").innerHTML= metes + " m";
				}
			};

		   function onError(error) {
				
		   }
	}
	
	$scope.showDirection  = function() {
		$(".modal-backdrop").addClass("modal-backdrop-fullscreen");
		var iframe = document.getElementById("frmDirection");
		
		iframe.src = "direction.html?_lat=" + detailData.latitude + "&_lng=" + detailData.longitude;
	};

	$scope.trustedHtml  = function(val) {
		return $sce.trustAsHtml(val.replace("\n", "<BR />"));
	};
	
	$scope.currentURL = function() {
		return window.location.href;
	};
	
	$scope.showPrice  = function(price, price_from, price_to) {
		//Xử lý price
		if(price >= 1000) price = parseInt(price/1000);
		if(isNumeric(price) == false) price = 0;
		if(price != 0) return (price/1000) + "k";
		
		//Xử lý price_from và price_to
		str = "";
		if(isNumeric(price_from) == false) price_from = 0;
		if(isNumeric(price_to) == false) price_to = 0;
		if(price_from >= 1000) price_from = parseInt(price_from/1000);
		if(price_to >= 1000) price_to = parseInt(price_to/1000);
		
		if(price_from != 0) str = price_from + "k";
		if((price_from != 0) && (price_to != 0)) str = str + " - ";
		if(price_to != 0) str = str + price_to + "k";
		
		return str;
	};
	
	$scope.showAsDate  = function(_time) {
		date = new Date(_time*1000);
		_month = date.getMonth() + 1;
		_date = date.getDate();
		_year = date.getFullYear();

		result = (_date < 10 ? "0" + _date  : _date) + "/" + (_month < 10 ? "0" + _month.toString() : _month) + "/" + (_year  < 10 ? "0" + _year : _year);
		
		return result;
	};
	
	$scope.urlAddress = function() {
        url = window.location.search;
		
		if(url.length > 0) url = window.location.search.substring(1);
		else url = "";
        return url;
     };
	 $scope.searchSubmit =  function() {
		return false;
	};

	//Thêm Cmt vào hệ thống
	$scope.doCheckin = function() {
		cmt = $('#form-review-message').val();
		_id = $('#_id').val();
		files = $('#upload').prop('files');
		
		if(cmt.length < 6) {
			swal('Nhập ít nhất 6 ký tự');
			return;
		}

		if(files.length < 2) {
			swal('Để checkin, cần upload tối thiểu 2 ảnh');
			return;
		}
		
		if(files.length > 4) {
			swal('Bạn chỉ được upload tối đa 4 ảnh');
			return;
		}
		
		form_data = new FormData();
		for(i = 0; i < files.length; i++) {
			form_data.append('upload[' + i + ']', files[i]);
		}
		form_data.append('cmt', cmt);
		form_data.append('checkin', 1);
		form_data.append('_id', _id);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi update
				
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=point&f=addCmt',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length > 50) {
					$scope.data = JSON.parse(result.data);;
					$("#write-review-form")[0].reset();
					//$state.reload();
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
		unLockScrent();	//Lock screen khi update xong
	};
	
	//Thêm Cmt vào hệ thống
	$scope.doCmt = function() {
		cmt = $('#form-review-message').val();
		_id = $('#_id').val();
		files = $('#upload').prop('files');
		
		if(cmt.length < 6) {
			swal('Nhập ít nhất 6 ký tự');
			return;
		}
		
		if(files.length > 4) {
			swal('Bạn chỉ được upload tối đa 4 ảnh');
			return;
		}
		
		form_data = new FormData();
		for(i = 0; i < files.length; i++) {
			form_data.append('upload[' + i + ']', files[i]);
		}
		form_data.append('cmt', cmt);
		form_data.append('_id', _id);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi update
				
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=point&f=addCmt',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length > 50) {
					$scope.data = JSON.parse(result.data);;
					$("#write-review-form")[0].reset();
					//$state.reload();
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
		unLockScrent();	//Lock screen khi update xong
	};
	
	$scope.changeToEdit =  function(id) {
		cmt_id = "cmt_" + id;
		text_id = "text_" + id;
		
		data = document.getElementById(cmt_id).innerHTML;
		
		$("#cmted_" + id).show();
		$("#cmt_" + id).hide();
		$("#change-action-" + id).hide();
		$("#submit-action-" + id).show();
		
		
	};
	
	$scope.submitForm =  function(review_id) {
		
		txtReview = "txt_" + review_id;
		cmt_id = "cmt_" + review_id;

		content = $("#" + txtReview).val();

		var form_data = new FormData();
		_id = $('#_id').val();
		form_data.append('_id', _id);
		form_data.append('review_id', review_id);
		form_data.append('content', content);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi đang update
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=point&f=editCmt',
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				if(result.data.length > 50) {
					$scope.data = JSON.parse(result.data);;
					//$("#write-review-form")[0].reset();
					//$state.reload();
					$("#cmted_" + review_id).hide();
					$("#cmt_" + review_id).show();
					$("#change-action-" + review_id).show();
					$("#submit-action-" + review_id).hide();
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
				
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
		unLockScrent();	//Lock screen khi update xong
	};
	
	$scope.cancelSubmit =  function(id) {
		cmt_id = "cmt_" + id;
		text_id = "text_" + id;
		
		data = document.getElementById(cmt_id).innerHTML;
		
		$("#cmted_" + id).hide();
		$("#cmt_" + id).show();
		$("#change-action-" + id).show();
		$("#submit-action-" + id).hide();
	};
	
	$scope.deleteCmt =  function(review_id) {
		jConfirm('Bạn có chắc muốn xóa bình luận này?', 'Xác nhận',function(r){
				if(r == true) {
						_id = $('#_id').val();
						var form_data = new FormData();
						form_data.append('_id', _id);
						form_data.append('review_id', review_id);
						form_data.append('csrf', $scope.csrf);
						lockScrent();	//Lock screen khi update 
				
						$.ajax({
						async: false,
						cache: false,
						url: 'service.php?sv=point&f=deleteCmt',
						data: form_data,
						type: 'POST',
						enctype: 'multipart/form-data',
						contentType: false,
						processData: false,
						success: function(jsonText, textStatus, jqXHR) {
							var result  = JSON.parse(jsonText);
							$scope.csrf = result.csrf;
							$scope.uid =  result.uid;

							if(result.data.length > 50) {
								$scope.data = JSON.parse(result.data);;
								//$("#write-review-form")[0].reset();
								$("#review_" + review_id).hide();
								//$state.reload();
							} else {
								swal("Không xóa luận được");
							}
							
						},
						error: function() {
							swal("Không truy xuất được vào hệ thống");
						}
						
					});		
					unLockScrent();	//Lock screen khi update xong		
				}

		});
	}
	
 });
 
 mainApp.controller("signinCtrl", function($scope, $http) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	//Trường hợp url có parametar => đang lấy lại pass
	search =  window.location.search;
	if(search.length > 0) {
		search = search.substring(1);		//Cắt bỏ ký tự ?
		
		obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		
		if(obj.email != undefined && obj.token != undefined) {
			//Gọi service để lấy pass mới vào hệ thống
			query = 'email=' + obj.email + '&token=' + obj.token + '&csrf=' + $scope.csrf;
			$.ajax({ 
				async: false,
				cache: false,                                
				url: 'service.php?sv=user&f=resetpass',
				type: "POST",
				data : query,
				success: function(jsonText, textStatus, jqXHR) {
					var result  = JSON.parse(jsonText);
					$scope.csrf = result.csrf;
					if(result.data == 1) {
						swal("Thành công, mật khẩu mới đã được gởi đến email của ban!");
					} else if(result.data == -12) {
						swal("Không khởi tạo được, hãy liên hệ admin");
					}
					else if(jsonText == -10) {
						swal("Không truy xuất được hệ thống, lỗi thao tác ", "Thông báo");
					}
					else swal("Không truy xuất được hệ thống");
				},
				error: function() {
					swal("Không truy xuất được hệ thống");
				}
			});
		}
	}
	
	
	//Khi user click button login
	$scope.doSignin = function() {
		email = $('#form-signin-email').val();
		password = $('#form-signin-password').val();
		bool = true;
		//Kiễm tra xem user có nhập password
		if(password.length < 6) { 
			$('#password_message').html("Password ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#password_message').html("");
		 }
		 
		 //Kiễm tra xem user có nhập email
		 if(email.length == 0) { 
			$('#email_message').html("Bạn chưa nhập Email");
			 bool = false;
		 } else {
			$('#email_message').html("");
		 }
		 
		 //Kiễm tra format của email
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if((re.test(email) == false) && (email.length > 0)) {
			$('#email_message').html("email không đúng format");
			 bool = false;
			 } else if((re.test(email) == true) && (email.length > 0)) {
			$('#email_message').html("");
		}
		// Trường hợp user input thông tin hợp lệ
		if(bool == true) {
			query = 'email=' + email + '&pss=' + password + '&csrf=' + $scope.csrf;
			//Gọi service để login vào hệ thống
			$.ajax({ 
				async: false,
				cache: false,                                
				url: 'service.php?sv=user&f=signin',
				type: "POST",
				data : query,
				success: function(jsonText, textStatus, jqXHR) {
					var result  = JSON.parse(jsonText);
					$scope.csrf = result.csrf;
					$scope.uid =  result.data;
					if($scope.uid.length > 5) {
						window.localStorage.setItem('uid', $scope.uid);
						window.location.href = "profile.html";
					} else {
						window.localStorage.setItem('uid', "");
						$('#acc_message').html("Email hoặc mật khẩu không chính xác");
					}
				},
				error: function() {
					swal("Không truy xuất được hệ thống");
				}
			});

		}
	};
 });
 
 
mainApp.controller("regsiterCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	$scope.doRegister = function() {
		 var full_name = $('#form-register-full-name').val();
		 var email = $('#form-register-email').val();
		 var reemail = $('#form-register-confirm-email').val();
		 var gender = $('input[name=form-register-gender]:checked', '#form-register').val(); 
		 var digit = $('#digit').val();
		 
		 
		 bool = true;

		 //Chưa họ tên
		 if(full_name.length < 6) { 
			 $('#fullname_message').html("Full name ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#fullname_message').html("");
		 }
		 
		 //Chưa nhập email 
		 if(email.length == 0) { 
			 $('#email_message').html("Xin vui lòng nhập email");
			 bool = false;
		 } else {
			$('#email_message').html("");
		 }
		 
		 //Chưa nhập email xác nhận
		 if(reemail.length == 0) { 
			 $('#reemail_message').html("Xin vui lòng nhập vào xác nhận email");
			 bool = false;
		 } else  {
			$('#reemail_message').html("");
		 }
		 
		 //Trường hợp 2 email không giống nhau
		 if((reemail != email) && (email.length > 0) && (reemail.length > 0)){
		 $('#reemail_message').html("Phần xác nhận email không trùng khớp");
			 bool = false;
		 } else if((reemail == email) && (email.length > 0) && (reemail.length > 0)) {
			$('#reemail_message').html("");
		 }
		 
		 //Kiễm tra format của email
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if((re.test(email) == false)  && (email.length > 0)) {
			$('#email_message').html("Không đúng format");
			 bool = false;
		} else if((re.test(email) == true)  && (email.length > 0)){
			$('#email_message').html("");
		}
		//Kiễm tra format của email xác nhận
		if((re.test(reemail) == false) && (reemail.length > 0)) {
			$('#reemail_message').html("Không đúng format");
			 bool = false;
		} else if((re.test(reemail) == true) && (reemail.length > 0)){
			$('#reemail_message').html("");
		}
		
		//Kiễm tra danh xưng
		if((gender != 1) && (gender != 2)) {
			bool = false;
			$('#gender_message').html("Nhập danh xưng");
		} else {
			$('#gender_message').html("");
		}
		
		//Chưa họ tên
		 if(digit.length <= 0) { 
			 $('#digit_message').html("Bạn phải nhập mã bảo vệ");
			 bool = false;
		 } else {
			$('#digit_message').html("");
		 }
		
		// Trường hợp user input thông tin hợp lệ
		if(bool == true) {
			query = 'full_name=' + full_name + '&email=' + email + '&gender=' + gender+ '&digit=' + digit + "&csrf=" +$scope.csrf;
			//Gọi service để login vào hệ thống
			$.ajax({ 
				async: false,
				cache: false,                                
				url: 'service.php?sv=user&f=register',
				type: "POST",
				data : query,
				success: function(jsonText, textStatus, jqXHR) {
					var result  = JSON.parse(jsonText);
					$scope.csrf = result.csrf;
					
					if(result.data == -6) 
						$('#acc_message').text('Lỗi hệ thống, xin vui lòng liên lạc admin');
					if(result.data == -2) 
						$('#acc_message').text('Email này đã tồn tại');
					else if(result.data == -12) {
						$('#digit_message').text('Mã bảo vệ không chính xác');
						swal("Mã bảo vệ không chính xác");
					}
					else if(result.data < 0)
						$('#acc_message').text('Lỗi tháo tác');
					else if(result.data != 0) 
						$('#acc_message').text('Lỗi hệ thống, xin vui lòng liên lạc admin');
					else if(result.data == 0) {
					/*
						jAlert('Bạn đã đăng ký thành công, xin vui lòng kiểm tra email để nhận password', 'Thông báo',function(){
								window.location.href = "signin.html";
							});
					*/
						swal({
						  text: "Bạn đã đăng ký thành công, xin vui lòng kiểm tra email để nhận password",
						  confirmButtonColor: '#3085d6',
						  confirmButtonText: 'OK'
						}).then(function () {
						  window.location.href = "signin.html";
						});
						
					}
				},
				error: function() {
					swal("Không truy xuất được hệ thống");
				}
			});

		}
	};
 });


mainApp.controller("profileCtrl", function($scope, $state) {
	$scope.myClass = [];
	search = window.location.search + "";
	_uid = "";
	lockScrent();
	$scope.config = init($scope);
	url = '';
	if(search.length > 0) url = 'service.php?sv=user&f=profile&uid=' + window.location.search.substring(1);
	else url = 'service.php?sv=user&f=profile';
	
	//Gọi service để load data vào hệ thống
	$.ajax({ 
		async: false,
		cache: false,                                
		url: url,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			var result  = JSON.parse(jsonText);
			$scope.csrf = result.csrf;
			$scope.uid =  result.uid;
			$scope.data =  JSON.parse(result.data);

			$scope.burl = $scope.data.profile._id;
			if($scope.data.profile.slug.length > 0) $scope.burl = $scope.data.profile.slug;
			
			//Trường hợp đây không phải là profile của user này
			if((result.data.length > 50) && (search.length > 5)) 
				tuid = $scope.data.profile._id;
			
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
		}
	});

	unLockScrent();
	
	$scope.trustedHtml  = function(val) {
		return $sce.trustAsHtml(val.replace("\n", "<BR />"));
	};
	
	$scope.doChangeProfile = function() {
		var full_name = $('#full_name').val();
		var description = $('#description').val();
		var burl = $('#burl').val();

		lockScrent();	//Khóa màn hình
		bool = true;

		 //Chưa họ tên
		 if(full_name.length < 6) { 
			 $('#fullname_message').html("Full name ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#fullname_message').html("");
		 }

		 //Chưa họ tên
		 if((burl.length > 6) && (burl.length < 6)) { 
			 $('#burl_message').html("URL cá nhân ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#burl_message').html("");
		 }


		var form_data = new FormData();
		_id = $scope.uid;
		form_data.append('_id', _id);
		form_data.append('full_name', full_name);
		form_data.append('burl', burl);
		form_data.append('description', description);
		form_data.append('csrf', $scope.csrf);
		
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=changeProfile' ,
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length > 50) {
					swal("Đã cập nhật Thông tin cá nhân");
					var link = document.getElementById("burl_link");
				    url = "https://onroa.com/bmap.html?" + burl;
				    link.innerHTML = url;
				    link.setAttribute('href', url);
				} else if (result.data == -7) {
					swal("[URL cá nhân] này đã có người khác đăng ký ");	
					$('#burl_message').html("URL này đã có người khác đăng ký");
				} else if (result.data == -1) {
					swal("[URL cá nhân] này đã có người khác đăng ký ");	
					$('#burl_message').html("URL này đã có người khác đăng ký");
				}
				else swal("Không cập nhận được profile");
			},
			error: function() {
				swal('Không truy xuất được hệ thống');
			}
			
		});

		unLockScrent();	//Cập nhật thông tin thành công, mở khóa
	};
	
	$scope.doChangePassword = function() {
		pass = $('#current-password').val();
		newpass = $('#new-password').val();
		confirmpass = $('#confirm-new-password').val();
		bool = true;
		
		//Kiễm tra xem user có nhập password
		if(pass.length < 6) { 
			$('#current-password-message').html("Mật khẩu ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#current-password-message').html("");
		 }
		
		//Kiễm tra xem user có nhập new password
		if(newpass.length < 6) { 
			$('#new-password-message').html("Mật khẩu mới phải ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#new-password-message').html("");
		 }
		 
		 //Kiễm tra xem user có nhập new password
		if(confirmpass.length < 6) { 
			$('#confirm-new-password-message').html("Nhập lại mật khẩu phải ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#confirm-new-password-message').html("");
		 }
		 
		 if((newpass.length >= 6) && (confirmpass.length >= 6) && (newpass != confirmpass)) {
			$('#confirm-new-password-message').html("Nhập lại mật khẩu phải giống mật phẩu mới");
			 bool = false;
		 } else {
			$('#confirm-new-password-message').html("");
		 }
		 
		 //Trường hợp bị lỗi, dừng xử lý
		 if(bool == false) return false;

		 lockScrent();	// Khóa màn hình
		 
		var form_data = new FormData();
		form_data.append('_id', $scope.uid);
		form_data.append('pass', pass);
		form_data.append('newpass', newpass);
		form_data.append('confirmpass', confirmpass);
		form_data.append('csrf', $scope.csrf);
		
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=changePassword',
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				
				if(result.data == -13) {
					$('#current-password-message').html("Mật khẩu hiện tại không chính xác");
					swal("Mật khẩu hiện tại không chính xác");
					return false;
				}

				if(result.data.length > 50) {
					swal("Cập nhật mật khẩu thành công");
					$("#form-password")[0].reset();
				}
				else swal("Không cập nhận được mật khẩu");
			},
			error: function() {
				swal('Không truy xuất được hệ thống');
			}
			
		});
		unLockScrent();	//Cập nhật thông tin thành công, mở khóa
	};
	
	$scope.doChangeAvatar = function() {
		var files = $('#upload').prop('files');
		if(files.length == 0) {
			swal('Bạn phải chọn một file làm avatar');
			return false;
		}
		lockScrent();	// Khóa màn hình
		var form_data = new FormData();
		form_data.append('upload', files[0]);
		form_data.append('_id', $scope.uid);
		form_data.append('csrf', $scope.csrf);
		
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=uploadAvatar',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length >= 10) {
					swal("Đã upload thành công");
					$("#form-avatar")[0].reset();
					$scope.data.profile.avatar = result.data;
				}
				else swal("Không upload avatar được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
		unLockScrent();	//Cập nhật thông tin thành công, mở khóa
	};
 });
 
 mainApp.controller("contactCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	$scope.sendContact = function() {
		fullname = $('#full-name').val();
		email = $('#email').val();
		message = $('#message').val();
		digit = $('#digit').val();
		
		bool = true;
		
		//Kiễm tra tên
		if(fullname.length < 6) {
			$('#fullname_message').html("Họ tên phải ít nhất 6 ký tự");
			 bool = false;
		 } else {
			$('#fullname_message').html("");
		 }
		
		//Kiễm tra xem user có nhập email
		 if(email.length == 0) { 
			$('#email_message').html("Bạn chưa nhập Email");
			 bool = false;
		 } else {
			$('#email_message').html("");
		 }
		 
		 //Kiễm tra format của email
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if((re.test(email) == false) && (email.length > 0)) {
			$('#email_message').html("email không đúng format");
			 bool = false;
			 } else if((re.test(email) == true) && (email.length > 0)) {
			$('#email_message').html("");
		}
		
		//Kiễm tra nội dung
		if(message.length < 20) {
			$('#message_message').html("Bạn phải nhập ít nhất 20 ký tự");
			 bool = false;
		 } else {
			$('#message_message').html("");
		 }
		 
		 //Kiễm tra mã bảo vệ
		 if(digit.length == 0) { 
			//$('#digit_message').html("Bạn chưa nhập Mã bảo vệ");
			document.getElementById("digit_message").innerHTML = "Bạn chưa nhập Mã bảo vệ<br>";
			 bool = false;
		 } else {
			document.getElementById("digit_message").innerHTML = "";
		 }
		 
		 if(bool == true) {
		 
			var form_data = new FormData();
			form_data.append('fullname', fullname);
			form_data.append('email', email);
			form_data.append('message', message);
			form_data.append('digit', digit);
			form_data.append('csrf', $scope.csrf);
		
			 $.ajax({
				async: false,
				cache: false,
				url: 'service.php?sv=page&f=contact',
				data: form_data,
				type: 'POST',
				enctype: 'multipart/form-data',
				contentType: false,
				processData: false,
				success: function(jsonText, textStatus, jqXHR) {
					result  = JSON.parse(jsonText);
					if(result.data == 1) {
						/*
						jAlert("Cám ơn bạn đã liên lạc, chúng tôi sẽ phản hồi lại trong thời gian sớm nhất", "Thông báo", function(r) {
							$("#contact-form")[0].reset();
							location.reload();
						});
						*/
						swal({
						  text: "Cám ơn bạn đã liên lạc, chúng tôi sẽ phản hồi lại trong thời gian sớm nhất",
						  confirmButtonColor: '#3085d6',
						  confirmButtonText: 'OK'
						}).then(function () {
						  $("#contact-form")[0].reset();
						  location.reload();
						});
					} else if(result.data == -12) {
						document.getElementById("digit_message").innerHTML = "Mã bảo vệ không chính xác<br>";
						swal("Mã bảo vệ không chính xác");
					}
					else if(jsonText == 11) {
						swal("Không truy xuất được hệ thống, bạn hãy thử lại ");
					}
					else if(jsonText < 0) {
						swal("Lỗi thao tác ");
					}
					else swal("Không truy xuất được hệ thống");
				},
				error: function() {
					swal("Không truy xuất được hệ thống");
				}
				
			});
		}
	};
	
 });
 
 mainApp.controller("lostpassCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	$scope.doLostpass = function() {
		email = $('#form-lostpass-email').val();
		digit = $('#digit').val();
		
		bool = true;
		
		//Kiễm tra xem user có nhập email
		 if(email.length == 0) { 
			$('#email_message').html("Bạn chưa nhập Email");
			 bool = false;
		 } else {
			$('#email_message').html("");
		 }
		 
		 //Kiễm tra format của email
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if((re.test(email) == false) && (email.length > 0)) {
			$('#email_message').html("email không đúng format");
			 bool = false;
			 } else if((re.test(email) == true) && (email.length > 0)) {
			$('#email_message').html("");
		}
		
		
		//Kiễm tra mã bảo vệ
		 if(digit.length == 0) { 
			//$('#digit_message').html("Bạn chưa nhập Mã bảo vệ");
			document.getElementById("digit_message").innerHTML = "Bạn chưa nhập Mã bảo vệ<br>";
			 bool = false;
		 } else {
			document.getElementById("digit_message").innerHTML = "";
		 }
		 
		 if(bool == true) {
			var form_data = new FormData();
			form_data.append('email', email);
			form_data.append('digit', digit);
			form_data.append('csrf', $scope.csrf);
			
			$.ajax({
				async: false,
				cache: false,
				url: 'service.php?sv=user&f=lostpass',
				data: form_data,
				type: 'POST',
				enctype: 'multipart/form-data',
				contentType: false,
				processData: false,
				success: function(jsonText, textStatus, jqXHR) {
					result  = JSON.parse(jsonText);
					if(result.data == 1) {
						/*
						jAlert("Email phục hồi mật khẩu sẽ được gởi đến tài khoản của bạn", "Thông báo", function(r) {
							$("#form-lostpass")[0].reset();
							window.location.href = "signin.html";
						});
						*/
						swal({
						  text: "Email phục hồi mật khẩu sẽ được gởi đến tài khoản của bạn",
						  confirmButtonColor: '#3085d6',
						  confirmButtonText: 'OK'
						}).then(function () {
							$("#form-lostpass")[0].reset();
							window.location.href = "signin.html";
						});
						
					} else if(result.data == -12) {
						document.getElementById("digit_message").innerHTML = "Mã bảo vệ không chính xác<br>";
						swal("Mã bảo vệ không chính xác");
					}
					else if(result.data == 11) {
						swal("Không truy xuất được hệ thống, bạn hãy thử lại ");
					}
					else if(result.data == 2) {
						swal("User này chưa đăng ký, bạn hãy kiễm tra lại");
					}
					else if(result.data < 0) {
						swal("Lỗi thao tác ");
					}
					else swal("Không truy xuất được hệ thống");
				},
				error: function() {
					swal("Không truy xuất được hệ thống");
				}
				
			});
		 }
	};
 });
 
 mainApp.controller("listsearchCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	search =  window.location.search;
	
	//Trường hợp url có parametar (forward từ trang detail sang)
	keyword = "";
	arr_category = null;

	lockScrent();	// Khóa màn hình
	
	//Trường hợp không chọn catalogue, set default là 1
	if(search.length == 0) search = '?cata=1';
	
	if(search.length > 0) {
		search = search.substring(1);		//Cắt bỏ ký tự ?
		
		//Convert chuổi query trên URL thành Object
		obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		if(obj.key != undefined) {
			$("#keyword").val(obj.key);
		}
		
		
		if(obj.cata == undefined) obj.cata = 1;
			
		if(obj.cata != undefined)  {
			str = obj.cata + "";
			str = str.replace(" ","");
			arr_category = str.split(',');
		}
	}
	
	
	$scope = 
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=point&f=listsearch&key=' + obj.key +'&cata=' + obj.cata + '&_lat=' + obj._lat + "&_lng=" + obj._lng,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			result  = JSON.parse(jsonText);
			$scope.csrf = result.csrf;
			$scope.uid =  result.uid;
			$scope.itemList =  JSON.parse(result.data);

			
			if($scope.itemList.length == 0) {
				swal('Không tìm được địa điểm thích hợp');
			}
		},
		error: function() {
			swal('Không truy xuất được hệ thống');
		}
	});
	unLockScrent();	//Cập nhật thông tin thành công, mở khóa
 });
 
 mainApp.controller("submitCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);

	$scope.doSubmit = function() {
		title = $('#title').val();
		des = $('#des').val();
		address = $('#address').val();
		city = $('#city').val();
		phone = $('#phone-number').val();
		email = $('#email').val();
		website = $('#website').val();
		lat = $('#lat').val();
		lng = $('#lng').val();
		catalogue = $('#catalogue').val();
		owner = $('#owner').val();
		files = $('#upload').prop('files');
		bool = true;
		//Check title
		if(title.length <= 0 ) { 
			 $('#title_message').html("Bạn phải nhập Tên địa điểm");
			 bool = false;
		 } else {
			$('#title_message').html("");
		 }
		 
		 if((title.length > 0 ) && (title.length < 4)){ 
			 $('#title_message').html("Tên địa điểm phải trên 4 ký tự");
			 bool = false;
		 } else {
			$('#title_message').html("");
		 }
		 
		 //Check des
		if(des.length <= 0 ) { 
			 $('#des_message').html("Bạn phải nhập mô tả");
			 bool = false;
		 } else {
			$('#des_message').html("");
		 }
		 
		 if((des.length > 0 ) && (des.length < 20 )) { 
			 $('#des_message').html("Phần mô tả phải hơn 20 ký tự");
			 bool = false;
		 } else {
			$('#des_message').html("");
		 }
		 
		 
		 //Check address
		if(address.length <= 0 ) { 
			 $('#address_message').html("Bạn phải nhập địa chỉ");
			 bool = false;
		 } else {
			$('#address_message').html("");
		 }
		 
		 //Check city
		if(city.length <= 0 ) { 
			 $('#city_message').html("Bạn phải nhập thành phố");
			 bool = false;
		 } else {
			$('#city_message').html("");
		 }
		 
		 //Check catalogue
		if(catalogue.length <= 0 ) { 
			 $('#catalogue_message').html("Bạn phải nhập loại hình");
			 bool = false;
		 } else {
			$('#catalogue_message').html("");
		 }
		 
		 //Check owner
		if(owner.length <= 0 ) { 
			 $('#owner_message').html("Bạn phải nhập sở hữu");
			 bool = false;
		 } else {
			$('#owner_message').html("");
		 }
		 
		 //Kiễm tra format của email
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if((re.test(email) == false)  && (email.length > 0)) {
			$('#email_message').html("Không đúng format");
			 bool = false;
		} else if((re.test(email) == true)  && (email.length > 0)){
			$('#email_message').html("");
		}
		
		if((lat.length <= 0 ) || (lng.length <= 0 )){ 
			 $('#lat_lng_message').html("Bạn phải nhập tọa độ");
			 bool = false;
		 } else {
			$('#lat_lng_message').html("");
		 }
		 
		 if((lat.length > 0 &&  isNumeric(lat) == false) || (lng.length > 0 &&isNumeric(lng) == false )){ 
			 $('#lat_lng_message').html("Tọa độ phải là con số");
			 bool = false;
		 } else if((lat.length > 0 &&  isNumeric(lat) == true) && (lng.length > 0 &&isNumeric(lng) == true )){
			$('#lat_lng_message').html("");
		 }
		 
		 if(files.length < 4) {
			$('#upload_message').html("Bạn phải upload ít nhất 4 ảnh");
		 } else {
			$('#upload_message').html("");
		 }
		 
		 if(bool == false) {
			 swal("Dữ liệu nhập bị sai, xin vui lòng kiễm tra lại");
			 return;
		}
		
		
		form_data = new FormData();
		form_data.append('title', title);
		form_data.append('des', des);
		form_data.append('address', address);
		form_data.append('city', city);
		form_data.append('phone', phone);
		form_data.append('email', email);
		form_data.append('website', website);
		form_data.append('lat', lat);
		form_data.append('lng', lng);
		form_data.append('catalogue', catalogue);
		form_data.append('owner', owner);
		
		
		for(i = 0; i < files.length; i++) {
			form_data.append('upload[' + i + ']', files[i]);
		}
		
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi đang update
		//return;
		//alert(content);
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=point&f=addPoint',
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				if(result.data == 1) {
					/*
					jAlert("Địa điểm của bạn đã được khởi tạo và đang chờ xét duyệt, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",function(){
								window.location = "submit.html";
							});
					*/
					swal({
						  text: "Địa điểm của bạn đã được khởi tạo và đang chờ xét duyệt, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
						  confirmButtonColor: '#3085d6',
						  confirmButtonText: 'OK'
						}).then(function () {
							window.location.href = "signin.html";
						});
				}
				else swal("Không tạo địa điểm mới được, xin hãy liên hệ admin");
				
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});

		unLockScrent();	//Cập nhật thông tin thành công, mở khóa
	}
 });
 
function addressChange() {
	address = $('#address').val();
	city = document.getElementById("city");
	city_name = city.options[city.selectedIndex].text;
	
	local = address + " " + city_name + " Việt Nam";
	
	if(address.length == 0 || city.selectedIndex == 0) return;
	if(local.length < 2) return;
	
	$.getJSON('https://maps.google.com/maps/api/geocode/json?address=' + local, function(data) {
			
			if(data.status == 'OK') {
				_lat = data.results[0].geometry.location.lat;
				_lng = data.results[0].geometry.location.lng;	
				lat = $('#lat').val();
				lng = $('#lng').val();
				if(lat.length > 0 && lng.length > 0) {
					jConfirm('Bạn vừa thay đổi địa chỉ, bạn có muốn thay đổi toạ độ địa điểm của bạn', 'Xác nhận',function(r){
						if(r == true) {
							$('#lat').val(_lat);
							$('#lng').val(_lng);
							simpleMap(_lat, _lng, true);
						}
					});
				} else if(lat.length == 0 && lng.length == 0) {
					$('#lat').val(_lat);
					$('#lng').val(_lng);
					simpleMap(_lat, _lng, true);
				}
			}
		});
}

function latlngChange() {
	lat = $('#lat').val();
	lng = $('#lng').val();
	
	if(isNumeric(lat) == true && isNumeric(lng)) {
		simpleMap(lat, lng, true);
	}
}
 
 mainApp.controller("termCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
 });
  
 mainApp.controller("policyCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
 });
 
 
 var sp = 0;
 var msg_limit = 10;
 mainApp.controller("BMapCtrl", function($scope, $state, $sce) {
	$scope.myClass = [];	
	search = window.location.search + "";
	_uid = "";
	
	$scope.config = init($scope);
	url = "";
	if(search.length > 0) url = 'service.php?sv=user&f=BMap&uid=' + window.location.search.substring(1);
	else url = 'service.php?sv=user&f=BMap';
	
	lockScrent();	// khóa màn hình
	$.ajax({
		async: false,
		cache: false,
		url: url,
		type: 'GET',
		enctype: 'multipart/form-data',
		contentType: false,
		processData: false,
		success: function(jsonText, textStatus, jqXHR) {
			var result  = JSON.parse(jsonText);
			$scope.csrf = result.csrf;
			$scope.uid =  result.uid;
			if(result.data == -2) {
				swal("User hoặc BMap này không hợp lệ, xin vui lòng kiễm tra lại");
			}  else if(result.data == -3) {
				swal("User hoặc BMap này không tồn tại");

			} else if(result.data.length > 50) {
				result = JSON.parse(result.data);
				
				l = result.message.length;
				k = result.user_list.length;
				for(i = 0; i < l; i++) {
					for(j = 0; j < k; j++) {
						if(result.message[i].uid == result.user_list[j]._id) { 
							result.message[i].display_name = result.user_list[j]['display_name'];
							result.message[i].avatar = result.user_list[j]['avatar'];
						}
					}
				}
				
				$scope.messageList = result.message;
				$scope.target_uid = result._uid;
				$scope.points = result.points;
				$scope.map_url = window.location.search;
				$scope.target_name = result.target_name;
				text = '{ "data" : []}';
				obj = JSON.parse(text);
				obj.data = result.points;
				_latitude = getFloatCookie("_plat");
				_longitude = getFloatCookie("_plng"); 
				
				//Nếu kg có tọa độ, dùng tọa độ mặc định
				if(_latitude == 0) {
					 _latitude = 10.7797838;
					 _longitude = 106.6968061; 
				}

				if(sp + msg_limit > result.total_message) {
					$("#list-message-button").hide();
				} else {
					$("#list-message-button").show();
				}

				sp = sp + msg_limit;
				
				createHomepageGoogleMap(_latitude,_longitude,obj);
			}
			else swal("Không truy xuất được hệ thống, xin hãy liên hệ admin");
			
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
		}
		
	});

	unLockScrent();	//Cập nhật thông tin thành công, mở khóa
	
    // Set if language is RTL and load Owl Carousel

    $(window).load(function(){
        var rtl = false; // Use RTL
        initializeOwl(rtl);
    });

    autoComplete();

    $scope.searchSubmit =  function() {
		keyword = $('#keyword').val();
		address = $('#location').val();
		arr_category = $('#category').val();
		
		doSearch(keyword, address, arr_category, 0, 0);
		return false;
	};

	 $scope.searchClick = function(keyword, category_id, lat, lng) {
		$('#keyword').val(keyword);
		document.getElementById('category').value = category_id;

		keyword = $('#keyword').val();
		arr_category = $('#category').val();
		
		doSearch(keyword, "", arr_category, lat, lng);
		return false;
	};
	
	$scope.trustedHtml  = function(val) {
		if(val == undefined) return "";
		return $sce.trustAsHtml(val.replace("\n", "<BR />"));
	};

	//Load message
	$scope.loadMessage = function() {
		_uid = $scope.target_uid;

		form_data = new FormData();		
		form_data.append('_uid', _uid);
		form_data.append('sp', sp);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi update
				
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=loadMessage',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length > 50) {
					result = JSON.parse(result.data);
					
					l = result.message.length;
					k = result.user_list.length;
					for(i = 0; i < l; i++) {
						for(j = 0; j < k; j++) {
							if(result.message[i].uid == result.user_list[j]._id) { 
								result.message[i].display_name = result.user_list[j]['display_name'];
								result.message[i].avatar = result.user_list[j]['avatar'];
							}
						}

						//Thêm vào List
						$scope.messageList.push(result.message[i]);
					}
					
					if(sp + msg_limit > result.total_message) {
						$("#list-message-button").hide();
					} else {
						$("#list-message-button").show();
					}

					sp = sp + msg_limit;
				
					$scope.$apply();
					$("#user-message-block").scrollTop($("#user-message-block")[0].scrollHeight);
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
	};

	//Refresh message
	$scope.refreshMessage = function() {
		_uid = $scope.target_uid;

		sp = 0;
		form_data = new FormData();		
		form_data.append('_uid', _uid);
		form_data.append('sp', sp);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi update
				
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=loadMessage',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				$scope.messageList = [];	//clear message list
				if(result.data.length > 50) {
					result = JSON.parse(result.data);
					
					l = result.message.length;
					k = result.user_list.length;
					for(i = 0; i < l; i++) {
						for(j = 0; j < k; j++) {
							if(result.message[i].uid == result.user_list[j]._id) { 
								result.message[i].display_name = result.user_list[j]['display_name'];
								result.message[i].avatar = result.user_list[j]['avatar'];
							}
						}

						//Thêm vào List
						$scope.messageList.push(result.message[i]);
					}
					
					if(sp + msg_limit > result.total_message) {
						$("#list-message-button").hide();
					} else {
						$("#list-message-button").show();
					}

					sp = sp + msg_limit;
				
					$scope.$apply();
					$("#user-message-block").scrollTop($("#user-message-block")[0].scrollHeight);
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
	};
	
	//Thêm Cmt vào hệ thống
	$scope.sendMessage = function() {
		message = $('#message').val();
		_uid = $scope.target_uid;

		if(message.length < 6) {
			swal('Nhập ít nhất 6 ký tự');
			return;
		}
		
		
		form_data = new FormData();
		
		form_data.append('message', message);
		form_data.append('_uid', _uid);
		form_data.append('csrf', $scope.csrf);
		lockScrent();	//Lock screen khi update
				
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=addMsg',
			data: form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;

				if(result.data.length > 50) {
					result = JSON.parse(result.data);
					
					l = result.message.length;
					k = result.user_list.length;
					for(i = 0; i < l; i++) {
						for(j = 0; j < k; j++) {
							if(result.message[i].uid == result.user_list[j]._id) { 
								result.message[i].display_name = result.user_list[j]['display_name'];
								result.message[i].avatar = result.user_list[j]['avatar'];
							}
						}
					}
					
					$scope.messageList = result.message;
				
					//$scope.messageList = JSON.parse(result.data);
					$("#write-message-form")[0].reset();
					//$state.reload();
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
	};
	
	$scope.changeToEdit =  function(id) {
		cmt_id = "msg_" + id;
		text_id = "text_" + id;
		
		data = document.getElementById(cmt_id).innerHTML;
		
		$("#msged_" + id).show();
		$("#msg_" + id).hide();
		$("#change-action-" + id).hide();
		$("#submit-action-" + id).show();
		
		
	};
	
	$scope.submitForm =  function(msg_id) {
		
		txtMsg = "txt_" + msg_id;
		message_id = "msg_" + msg_id;
		content = $("#" + txtMsg).val();
		_uid = $scope.target_uid;

		var form_data = new FormData();
		form_data.append('_uid', _uid);
		form_data.append('message_id', msg_id);
		form_data.append('content', content);
		form_data.append('csrf', $scope.csrf);
		//return;
		//alert(content);
		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=user&f=editMsg',
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				if(result.data.length > 50) {
				
					result = JSON.parse(result.data);
					
					l = result.message.length;
					k = result.user_list.length;
					for(i = 0; i < l; i++) {
						for(j = 0; j < k; j++) {
							if(result.message[i].uid == result.user_list[j]._id) { 
								result.message[i].display_name = result.user_list[j]['display_name'];
								result.message[i].avatar = result.user_list[j]['avatar'];
							}
						}
					}
					
					$scope.messageList = result.message;
				
					//$scope.messageList = JSON.parse(result.data);
					//$("#write-review-form")[0].reset();
					//$state.reload();
					$("#msged_" + msg_id).hide();
					$("#msg_" + msg_id).show();
					$("#change-action-" + msg_id).show();
					$("#submit-action-" + msg_id).hide();
				}
				else swal("Lỗi thao tác, không gởi bình luận được");
				
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
	};
	
	$scope.cancelSubmit =  function(id) {
		msg_id = "msg_" + id;
		text_id = "text_" + id;
		
		data = document.getElementById(msg_id).innerHTML;
		
		$("#msged_" + id).hide();
		$("#msg_" + id).show();
		$("#change-action-" + id).show();
		$("#submit-action-" + id).hide();
	};
	
	$scope.deleteMsg =  function(msg_id) {
		jConfirm('Bạn có chắc muốn xóa tin nhắn này?', 'Xác nhận',function(r){
				if(r == true) {
						_uid = $scope.target_uid;
						var form_data = new FormData();
						form_data.append('_uid', _uid);
						form_data.append('msg_id', msg_id);
						form_data.append('csrf', $scope.csrf);
				
						$.ajax({
						async: false,
						cache: false,
						url: 'service.php?sv=user&f=deleteMsg',
						data: form_data,
						type: 'POST',
						enctype: 'multipart/form-data',
						contentType: false,
						processData: false,
						success: function(jsonText, textStatus, jqXHR) {
							var result  = JSON.parse(jsonText);
							$scope.csrf = result.csrf;
							$scope.uid =  result.uid;

							if(result.data.length > 50) {
								$scope.messageList = JSON.parse(result.data);
								//$("#write-review-form")[0].reset();
								$("#message_" + msg_id).hide();
							} else {
								swal("Không xóa luận được");
							}
							
						},
						error: function() {
							swal("Không truy xuất được vào hệ thống");
						}
						
					});				
				}
		});
	};


 });
 
 mainApp.controller("supportCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
 });

 function getGroup(group_name, group_key, start_index, limit, $scope)  {
	query = "group_name=" + group_name + "&group_key=" + group_key + "&start_index=" + start_index + "&limit=" + limit;
	//Gọi service để load data vào hệ thống
	$.ajax({ 
		async: false,
		cache: false,                                
		url: 'service.php?sv=group&f=searchGroup&' + query,
		type: "GET",
		success: function(jsonText, textStatus, jqXHR) {
			if(jsonText == -1) {
				swal("Không truy xuất được hệ thống", );
				return;
			}
			result = JSON.parse(jsonText);
			$scope.itemList = result.data;
			$scope.cnt = result.cnt;
		},
		error: function() {
			swal("Không truy xuất được hệ thống");
				return;
		}
	});
}
 
 mainApp.controller("listGroupCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	getGroup("","",0,20, $scope);
	
	$scope.doSearchGroup = function() {
		group_name = $('#group_name').val();
		group_code = $('#group_code').val();
		
		if((group_name.length <= 4) || (group_code.length <= 4)) {
			swal("Bạn cần nhập [Tên Nhóm] hoặc [Mã Nhóm] để tìm kiếm");
			return;
		}
		
		//Nếu không truy xuất được hệ thống
		if(str == -1) {
			swal("Không truy xuất được hệ thống");
			return;
		}
		getGroup(group_name,group_code,0,20, $scope);
	}
 });
 
 mainApp.controller("createGroupCtrl", function($scope) {
	$scope.myClass = [];
	$scope.config = init($scope);
	
	title = $('#title').val();
	des = $('#des').val();
	catalogue = $('#catalogue').val();
	files = $('#upload').prop('files');
	
	$scope.doSubmit = function() {
		//Check title
		if(title.length <= 0 ) { 
			 $('#title_message').html("Bạn phải nhập Tên địa điểm");
			 bool = false;
		 } else {
			$('#title_message').html("");
		 }
		 
		 if((title.length > 0 ) && (title.length < 4)){ 
			 $('#title_message').html("Tên địa điểm phải trên 4 ký tự");
			 bool = false;
		 } else {
			$('#title_message').html("");
		 }
		 
		 //Check des
		if(des.length <= 0 ) { 
			 $('#des_message').html("Bạn phải nhập mô tả");
			 bool = false;
		 } else {
			$('#des_message').html("");
		 }
		 
		 if((des.length > 0 ) && (des.length < 20 )) { 
			 $('#des_message').html("Phần mô tả phải hơn 20 ký tự");
			 bool = false;
		 } else {
			$('#des_message').html("");
		 }
		 
		 //Check catalogue
		if(catalogue.length <= 0 ) { 
			 $('#catalogue_message').html("Bạn phải nhập loại hình");
			 bool = false;
		 } else {
			$('#catalogue_message').html("");
		 }
		 
		if(files.length <= 0) {
			$('#upload_message').html("Bạn phải upload ảnh đại diện");
		 } else {
			$('#upload_message').html("");
		 }
		 
		 if(bool == false) {
			 swal("Dữ liệu nhập bị sai, xin vui lòng kiễm tra lại");
			 return;
		}
		
		form_data = new FormData();
		form_data.append('title', title);
		form_data.append('des', des);
		form_data.append('catalogue', catalogue);
		form_data.append('upload', files[0]);

		form_data.append('csrf', $scope.csrf);

		$.ajax({
			async: false,
			cache: false,
			url: 'service.php?sv=group&f=createGroup',
			data : form_data,
			type: 'POST',
			enctype: 'multipart/form-data',
			contentType: false,
			processData: false,
			success: function(jsonText, textStatus, jqXHR) {
				unLockScrent();	//Lock screen khi update xong
				var result  = JSON.parse(jsonText);
				$scope.csrf = result.csrf;
				$scope.uid =  result.uid;
				if(result.data == 1) {
					
				}
				else swal("Không tạo nhóm mới được, xin hãy liên hệ admin");
				
			},
			error: function() {
				swal("Không truy xuất được hệ thống");
			}
			
		});
	}
 });