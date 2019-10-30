
var _latitude = 51.541599;
var _longitude = -0.112588;
var draggableMarker = true;
simpleMap(_latitude, _longitude,draggableMarker);
	

autoComplete();

function address_change() {
	var street = $("#street").val();
	var city = $("#city").val();
	var zip = $("#zip").val();
	var state = $("#state").val();
	var country = $("#country option:selected").text();
	var geo_str = "";
	var geo_json = "";
	
	if((street.length > 0) && (city.length > 0) && (country.length > 0)) {
		geo_str = street + ' ' + city + ' '  + zip + ' ' + state + ' ' + country;
		geo_str = encodeURI(geo_str);
	}
	
	//http://maps.google.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
	if(geo_str.length > 0)
	$.getJSON('http://maps.google.com/maps/api/geocode/json?address=' + geo_str, function(data) {
		//geo_json = $.parseJSON('[' + data + ']');
		//geo_json = eval('(' + data + ')');
		var data1 = data;
		if(data.status == "OK") {	
			var _lat = data.results[0].geometry.location.lat;
			var _lng = data.results[0].geometry.location.lng;
			 $("#latitude").val(_lat);
			 $("#longitude").val(_lng);
			position_change();
		}
	});
	
}

function position_change() {
	var _lat = $("#latitude").val();
	var _lng = $("#longitude").val();
	
	simpleMap(_lat, _lng,draggableMarker);
}

$(document).ready(function(){
            $("#upload").dropzone({
                paramName: 'photos',
                dictDefaultMessage: "Drag your images",
                clickable: true,
                enqueueForUpload: true,
                maxFilesize: 5,
                uploadMultiple: true,
                addRemoveLinks: true
            });

        });