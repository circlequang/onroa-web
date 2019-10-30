function search() {
	var keyword = $('#keyword').val();
	var location = $('#location').val();
	var category = $('#category').val();
	
	doSearch(keyword, location, category);
	return false;
}

function doSearch(key, address, cata, _latitude, _longitude) {
	//
	_lat = Math.floor( _latitude * 1000);
	_lng = Math.floor( _longitude * 1000);
	//Trường hợp có địa chỉ
	if(address.length > 0) {
		$.getJSON('https://maps.google.com/maps/api/geocode/json?address=' + address, function(data) {
			_latitude = data.results[0].geometry.location.lat;
			_longitude = data.results[0].geometry.location.lng;
			
			_lat = Math.floor( _latitude * 1000);
			_lng = Math.floor( _longitude * 1000);
			
			Meteor.call('search', key, cata, _lat, _lng, function (error, result) {
			if((result != undefined) && (result != null)) {
					//json = JSON.stringify(result);
					var text = '{ "data" : []}';
					var obj = JSON.parse(text);
					obj.data = result;
					createHomepageGoogleMap(_latitude,_longitude,obj);
				}  else {
					
				}
				autoComplete();
			});
			
		});
	} else {
		//Test
		Meteor.call('search', key, cata, _lat, _lng, function (error, result) {
		if((result != undefined) && (result != null)){
				var text = '{ "data" : []}';
				var obj = JSON.parse(text);
				obj.data = result;
				createHomepageGoogleMap(_latitude,_longitude,obj);
				
			}  else {
				
			}
			autoComplete();
		});
		
	}
	
	
	return false;
}