"use strict";
var $ = jQuery.noConflict();
var map = null;
var newMarkers = [];
var marker;
var mapCenter;
var mapOptions;
var markerClicked = 0;
var activeMarker = false;
var lastClicked = false;
var autocomplete;

var zwlat01 = 0.005;
var zwlat02 = 0.010;
var zwlng01 = 0.010;
var zwlng02 = 0.010;
var zwTimeInterval = 7000;
var zwzoom = 17;
//var mapStyles = [ {"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"saturation":-100},{"visibility":"on"},{"lightness":10}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":50}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}, {featureType:'road.highway',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-92},{lightness:60},{visibility:'on'}]}, {featureType:'landscape.natural',elementType:'all',stylers:[{hue:'#c8c6c3'},{saturation:-71},{lightness:-18},{visibility:'on'}]},  {featureType:'poi',elementType:'all',stylers:[{hue:'#d9d5cd'},{saturation:-70},{lightness:20},{visibility:'on'}]} ];
//Đổi backgroud của gmap
var mapStyles = [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
                featureType: 'poi.business',
                stylers: [{visibility: 'off'}]
              },
              {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{visibility: 'off'}]
              },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]

// Set map height to 100% ----------------------------------------------------------------------------------------------

var $body = $('body');
if( $body.hasClass('map-fullscreen') ) {
    if( $(window).width() > 768 ) {

        $('.map-canvas').height( $(window).height() - $('.header').height() );
    }
    else {
        $('.map-canvas #map').height( $(window).height() - $('.header').height() );
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Homepage map - Google
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createHomepageGoogleMap(_latitude,_longitude,json){
    $.get("assets/external/_infobox.js", function() {
        gMap();
    });
    function gMap(){
        // ====== QV ST
        if((vconfig != null) || (vconfig != undefined)) {
            zwlat01 = vconfig.zwlat01;
            zwlat02 = vconfig.zwlat02;
            zwlng01 = vconfig.zwlng01;
            zwlng02 = vconfig.zwlng02;
            zwzoom = vconfig.zwzoom;
            zwTimeInterval = vconfig.zwTimeInterval;
        }
        
        //Trường hợp vào bằng mobile
        
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            //Lấy setting từ mobile config 
             if((vconfig != null) || (vconfig != undefined)) {
                zwlat01 = vconfig.zmlat01;
                zwlat02 = vconfig.zmlat02;
                zwlng01 = vconfig.zmlng01;
                zwlng02 = vconfig.zmlng02;
                zwzoom = vconfig.zmzoom;
                zwTimeInterval = vconfig.zmTimeInterval;
            }
        }
        
        // ====== QV ED
        
        mapCenter = new google.maps.LatLng(_latitude,_longitude);
        
            mapOptions = {
                zoom: zwzoom,
                center: mapCenter,
                disableDefaultUI: false,
                scrollwheel: false,
                styles: mapStyles,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.BOTTOM_CENTER
                },
                panControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            };
            var mapElement = document.getElementById('map');

            //Kg reload lại map nếu map đã load từ trước
            if(map == null) map = new google.maps.Map(mapElement, mapOptions); 
            else  { 
                    clearMap(); //Trường hợp đã có data trước đó, clear data hiện tại
                    map.setZoom(15);
                }
            
            //=================== QV ST
            map.addListener('center_changed', function(event) {
                var lat = map.getCenter().lat();
                var lng = map.getCenter().lng();
                var dateObj = new Date();
                
                _lat = getFloatCookie("_lat");
                _lng = getFloatCookie("_lng");
                
                if(((lat >= _lat - zwlat01) && (lat <= _lat + zwlat02)) && 
                    ((lng >= _lng - zwlng01) && (lng <= _lng + zwlng02)))
                    return;
                
                setCookie("_lat", lat);
                setCookie("_lng", lng);
                setCookie("t0", dateObj.getTime());                     //Cờ t0 != 0 cho biết tọa độ đã thay đổi
                $("#location").val('');                 //Tọa độ thay đổi, xóa địa chỉ trên thanh URL
              });
            //=================== QV ED
            
        for (var i = 0; i < json.data.length; i++) {
        
            //Fix to 6 //QV
            json.data[i].latitude = parseFloat(json.data[i].latitude).toFixed(6);
            json.data[i].longitude = parseFloat(json.data[i].longitude).toFixed(6);
            
            // Google map marker content -----------------------------------------------------------------------------------

            if( json.data[i].color ) var color = json.data[i].color;
            else color = '';

            var markerContent = document.createElement('DIV');
            if( json.data[i].featured == 1 ) {
                markerContent.innerHTML =
                    '<div class="map-marker featured' + color + '">' +
                        '<div class="icon">' +
                        '<img src="' + json.data[i].type_icon +  '">' +
                        '</div>' +
                    '</div>';
            }
            else {
                markerContent.innerHTML =
                    '<div class="map-marker ' + json.data[i].color + '">' +
                        '<div class="icon">' +
                        '<img src="' + json.data[i].type_icon +  '">' +
                        '</div>' +
                    '</div>';
            }

            // Create marker on the map ------------------------------------------------------------------------------------
            

            marker = new RichMarker({
                position: new google.maps.LatLng( json.data[i].latitude, json.data[i].longitude ),
                map: map,
                draggable: false,
                content: markerContent,
                flat: true
            });

            newMarkers.push(marker);

            // Create infobox for marker -----------------------------------------------------------------------------------

            var infoboxContent = document.createElement("div");
            var infoboxOptions = {
                content: infoboxContent,
                disableAutoPan: false,
                pixelOffset: new google.maps.Size(-18, -42),
                zIndex: null,
                alignBottom: true,
                boxClass: "infobox",
                enableEventPropagation: true,
                closeBoxMargin: "0px 0px -30px 0px",
                closeBoxURL: "assets/img/close.png",
                infoBoxClearance: new google.maps.Size(1, 1)
            };

            // Infobox HTML element ----------------------------------------------------------------------------------------

            //var category = json.data[i].category;
            var category = json.data[i].type_name.vi; //QV
            infoboxContent.innerHTML = drawInfobox(category, infoboxContent, json, i);

            // Create new markers ------------------------------------------------------------------------------------------

            newMarkers[i].infobox = new InfoBox(infoboxOptions);

            // Show infobox after click ------------------------------------------------------------------------------------
            
            

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    google.maps.event.addListener(map, 'click', function(event) {
                        lastClicked = newMarkers[i];
                    });
                    activeMarker = newMarkers[i];
                    if( activeMarker != lastClicked ){
                        for (var h = 0; h < newMarkers.length; h++) {
                            newMarkers[h].content.className = 'marker-loaded';
                            newMarkers[h].infobox.close();
                        }
                        newMarkers[i].infobox.open(map, this);
                        newMarkers[i].infobox.setOptions({ boxClass:'fade-in-marker'});
                        newMarkers[i].content.className = 'marker-active marker-loaded';
                        markerClicked = 1;
                    }
                }
            })(marker, i));

            // Fade infobox after close is clicked -------------------------------------------------------------------------

            google.maps.event.addListener(newMarkers[i].infobox, 'closeclick', (function(marker, i) {
                return function() {
                    activeMarker = 0;
                    newMarkers[i].content.className = 'marker-loaded';
                    newMarkers[i].infobox.setOptions({ boxClass:'fade-out-marker' });
                }
            })(marker, i));
        }
        
        

        // Close infobox after click on map --------------------------------------------------------------------------------

        google.maps.event.addListener(map, 'click', function(event) {
            if( activeMarker != false && lastClicked != false ){
                if( markerClicked == 1 ){
                    activeMarker.infobox.open(map);
                    activeMarker.infobox.setOptions({ boxClass:'fade-in-marker'});
                    activeMarker.content.className = 'marker-active marker-loaded';
                }
                else {
                    markerClicked = 0;
                    activeMarker.infobox.setOptions({ boxClass:'fade-out-marker' });
                    activeMarker.content.className = 'marker-loaded';
                    setTimeout(function() {
                        activeMarker.infobox.close();
                    }, 350);
                }
                markerClicked = 0;
            }
            if( activeMarker != false ){
                google.maps.event.addListener(activeMarker, 'click', function(event) {
                    markerClicked = 1;
                });
            }
            markerClicked = 0;
        });

        // Create marker clusterer -----------------------------------------------------------------------------------------

        var clusterStyles = [
            {
                url: 'assets/img/cluster.png',
                height: 34,
                width: 34
            }
        ];

        var markerCluster = new MarkerClusterer(map, newMarkers, { styles: clusterStyles, maxZoom: 19 });
        markerCluster.onClick = function(clickedClusterIcon, sameLatitude, sameLongitude) {
            return multiChoice(sameLatitude, sameLongitude, json);
        };

        // Dynamic loading markers and data from JSON ----------------------------------------------------------------------

        google.maps.event.addListener(map, 'idle', function() {
            var visibleArray = [];
            for (var i = 0; i < json.data.length; i++) {
                if ( map.getBounds().contains(newMarkers[i].getPosition()) ){
                    visibleArray.push(newMarkers[i]);
                    $.each( visibleArray, function (i) {
                        setTimeout(function(){
                            if ( map.getBounds().contains(visibleArray[i].getPosition()) ){
                                if( !visibleArray[i].content.className ){
                                    visibleArray[i].setMap(map);
                                    visibleArray[i].content.className += 'bounce-animation marker-loaded';
                                    markerCluster.repaint();
                                }
                            }
                        }, i * 50);
                    });
                } else {
                    newMarkers[i].content.className = '';
                    newMarkers[i].setMap(null);
                }
            }

            var visibleItemsArray = [];
            $.each(json.data, function(a) {
                if( map.getBounds().contains( new google.maps.LatLng( json.data[a].latitude, json.data[a].longitude ) ) ) {
                    //var category = json.data[a].category; QV
                    var category = json.data[a].category_name.vi[0];
                    pushItemsToArray(json, a, category, visibleItemsArray);
                }
            });

            // Create list of items in Results sidebar ---------------------------------------------------------------------

            $('.items-list .results').html( visibleItemsArray );

            // Check if images are cached, so will not be loaded again

            $.each(json.data, function(a) {
                if( map.getBounds().contains( new google.maps.LatLng( json.data[a].latitude, json.data[a].longitude ) ) ) {
                    is_cached(json.data[a].gallery[0], a);
                }
            });

            // Call Rating function ----------------------------------------------------------------------------------------

            rating('.results .item');

            var $singleItem = $('.results .item');
            $singleItem.hover(
                function(){
                    newMarkers[ $(this).attr('id') - 1 ].content.className = 'marker-active marker-loaded';
                },
                function() {
                    newMarkers[ $(this).attr('id') - 1 ].content.className = 'marker-loaded';
                }
            );
        });

        redrawMap('google', map);
        map.setZoom(zwzoom);    //QV

        function is_cached(src, a) {
            var image = new Image();
            var loadedImage = $('.results li #' + json.data[a].id + ' .image');
            image.src = src;
            if( image.complete ){
                $(".results").each(function() {
                    loadedImage.removeClass('loading');
                    loadedImage.addClass('loaded');
                });
            }
            else {
                $(".results").each(function() {
                    $('.results li #' + json.data[a].id + ' .image').addClass('loading');
                });
                $(image).load(function(){
                    loadedImage.removeClass('loading');
                    loadedImage.addClass('loaded');
                });
            }
        }

        // Geolocation of user -----------------------------------------------------------------------------------------

        $('.geolocation').on("click", function() {
            if (navigator.geolocation) {
                var options = {
                  maximumAge: 6000,
                  timeout: 3000,
                  enableHighAccuracy: true,
               };
                navigator.geolocation.getCurrentPosition(success, onError, options);
            } else {
                console.log('Geo Location is not supported');
            }
        });

        function success(position) {
            var locationCenter = new google.maps.LatLng( position.coords.latitude, position.coords.longitude);
            map.setCenter( locationCenter );
            map.setZoom(16);

            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                "latLng": locationCenter
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat(),
                        lng = results[0].geometry.location.lng(),
                        placeName = results[0].address_components[0].long_name,
                        latlng = new google.maps.LatLng(lat, lng);

                    $("#location").val(results[0].formatted_address);
                }
            });

        }
        
        function onError(error) {
            //Tọa độ nhà thờ Đức Bà - tọa độ mặc định
            swal("Không xác định được tọa độ hiện tại của bạn, xin vui lòng kiễm tra GPS");
       }

        // Autocomplete address ----------------------------------------------------------------------------------------

        var input = document.getElementById('location') ;
        autocomplete = new google.maps.places.Autocomplete(input, {
            types: ["geocode"]
        });
        autocomplete.bindTo('bounds', map);
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
                map.setZoom(zwzoom);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(zwzoom);
            }

            //marker.setPosition(place.geometry.location);
            //marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }
        });
        
        //User position ==================== QV-- ST
        /*
        var userPosition = new google.maps.MarkerImage(
            'assets/img/bluedot_retina.png',
            null, // size
            null // origin
            //new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
            //new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
        );
        
        myMarker = new google.maps.Marker({
                //flat: true,
                icon: userPosition,
                map: map,
                optimized: false,
                position: mapCenter,
                title: 'I might be here',
                visible: true
            });
        
        var markerContent = document.createElement('DIV');
        markerContent.innerHTML =
                    '<div>' +
                        
                        '<img src="assets/img/bluedot_retina.png">' +
                        
                    '</div>';
        var myMarker = new RichMarker({
                position: mapCenter,
                map: map,
                //icon: userPosition,
                draggable: false,
                content: markerContent,
                flat: true
            });

           
        newMarkers.push(myMarker);
        */
        //User position ==================== QV-- ED


    }
}

/*
    Xóa toàn bộ marker, event trong map
*/
function clearMap() {
    //Nếu kg có item => không cần remove gì cả
    if(newMarkers.length == 0) return;
    
    try {
        //Xóa toàn bộ các marker
        for (var i = 0; i < newMarkers.length; i++) {
            google.maps.event.clearListeners(newMarkers[i].infobox, 'closeclick');
            newMarkers[i].content.className = '';
            newMarkers[i].setMap(null);
        }
        newMarkers.length = 0;

        google.maps.event.clearListeners(marker, 'click');
        google.maps.event.clearListeners(map, 'click');
        google.maps.event.clearListeners(activeMarker, 'click');
        google.maps.event.clearListeners(map, 'idle');
        google.maps.event.clearListeners(autocomplete, 'place_changed');
        redrawMap('google', map);
    } catch(ex) {}
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OpenStreetMap - Homegoogle.maps.event.clearListeners(map, 'bounds_changed');page
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createHomepageOSM(_latitude,_longitude,json,mapProvider){

    $.get("assets/external/_infobox.js", function() {
        osmMap();
    });

    function osmMap(){
        var map = L.map('map', {
                center: [_latitude,_longitude],
                zoom: zwzoom,
                scrollWheelZoom: false
        });

        L.tileLayer.provider(mapProvider).addTo(map);

        var markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });

        var loadedMarkers = [];

        // Create markers on the map -----------------------------------------------------------------------------------

        for (var i = 0; i < json.data.length; i++) {

            // Set icon for marker -------------------------------------------------------------------------------------

            if( json.data[i].type_icon ) var icon = '<img src="' + json.data[i].type_icon +  '">';
            else icon = '';

            if( json.data[i].color ) var color = json.data[i].color;
            else color = '';

            var markerContent =
                '<div class="map-marker ' + color + '">' +
                    '<div class="icon">' +
                    icon +
                    '</div>' +
                '</div>';

            var _icon = L.divIcon({
                html: markerContent,
                iconSize:     [36, 46],
                iconAnchor:   [18, 32],
                popupAnchor:  [130, -28],
                className: ''
            });

            var title = json.data[i].title;
            var marker = L.marker(new L.LatLng( json.data[i].latitude, json.data[i].longitude ), {
                title: title,
                icon: _icon
            });

            loadedMarkers.push(marker);

            // Infobox HTML element ------------------------------------------------------------------------------------

            //var category = json.data[i].category;
            var category = json.data[i].type_name.vi //QV
            var infoboxContent = document.createElement("div");
            marker.bindPopup(
                drawInfobox(category, infoboxContent, json, i)
            );
            markers.addLayer(marker);

            // Set hover states for marker -----------------------------------------------------------------------------

            marker.on('popupopen', function () {
                this._icon.className += ' marker-active';
            });
            marker.on('popupclose', function () {
                this._icon.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-clickable marker-loaded';
            });

        }

        map.addLayer(markers);

        // Animate already created markers -----------------------------------------------------------------------------

        animateOSMMarkers(map, loadedMarkers, json);
        map.on('moveend', function() {
            animateOSMMarkers(map, loadedMarkers, json);
        });

        markers.on('clusterclick', function (a) {

            var markersInCLuster = a.layer.getAllChildMarkers();
            var latitudeArray = [];
            var longitudeArray = [];

            for (var b=0; b < markersInCLuster.length; b++)
            {
                var formattedLatitude = parseFloat( markersInCLuster[b]._latlng.lat ).toFixed(6);
                var formattedLongitude = parseFloat( markersInCLuster[b]._latlng.lng ).toFixed(6);
                latitudeArray.push( formattedLatitude );
                longitudeArray.push( formattedLongitude );
            }

            Array.prototype.allValuesSame = function() {
                for(var i = 1; i < this.length; i++)
                {
                    if(this[i] !== this[0])
                        return false;
                }
                return true;
            };

            if( latitudeArray.allValuesSame() && longitudeArray.allValuesSame() ){
                multiChoice(latitudeArray[0], longitudeArray[0], json);
            }
            else {
                a.layer.zoomToBounds();
            }
        });

        $('.results .item').hover(
            function(){
                loadedMarkers[ $(this).attr('id') - 1 ]._icon.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-clickable marker-loaded marker-active';
            },
            function() {
                loadedMarkers[ $(this).attr('id') - 1 ]._icon.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-clickable marker-loaded';
            }
        );


        $('.geolocation').on("click", function() {
            map.locate({setView : true})
        });

        $('body').addClass('loaded');
        setTimeout(function() {
            $('body').removeClass('has-fullscreen-map');
        }, 1000);
        $('#map').removeClass('fade-map');

        redrawMap('osm', map);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Item Detail Map - Google
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function itemDetailMap(json){
    var mapCenter = new google.maps.LatLng(json.latitude,json.longitude);
    var mapOptions = {
        zoom: zwzoom,
        center: mapCenter,
        disableDefaultUI: true,
        scrollwheel: false,
        styles: mapStyles,
        panControl: false,
        zoomControl: false,
        draggable: true
    };
    var mapElement = document.getElementById('map-detail');
    var map = new google.maps.Map(mapElement, mapOptions);
    if( json.type_icon ) var icon = '<img src="' + json.type_icon +  '">';
    else icon = '';

    // Google map marker content -----------------------------------------------------------------------------------

    var markerContent = document.createElement('DIV');
    markerContent.innerHTML =
        '<div class="map-marker">' +
            '<div class="icon">' +
            icon +
            '</div>' +
        '</div>';

    // Create marker on the map ------------------------------------------------------------------------------------

    var marker = new RichMarker({
        position: new google.maps.LatLng( json.latitude, json.longitude ),
        map: map,
        draggable: false,
        content: markerContent,
        flat: true
    });

    marker.content.className = 'marker-loaded';
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Simple Google Map (contat, submit...)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function simpleMap(_latitude, _longitude, draggableMarker){
    var mapCenter = new google.maps.LatLng(_latitude, _longitude);
    var mapOptions = {
        zoom: zwzoom,
        center: mapCenter,
        disableDefaultUI: true,
        scrollwheel: false,
        styles: mapStyles,
        panControl: false,
        zoomControl: false,
        draggable: true
    };
    var mapElement = document.getElementById('map-simple');
    var map = new google.maps.Map(mapElement, mapOptions);

    // Google map marker content -----------------------------------------------------------------------------------

    var markerContent = document.createElement('DIV');
    markerContent.innerHTML =
        '<div class="map-marker">' +
            '<div class="icon"></div>' +
        '</div>';

    // Create marker on the map ------------------------------------------------------------------------------------

    var marker = new RichMarker({
        //position: mapCenter,
        position: new google.maps.LatLng( _latitude, _longitude ),
        map: map,
        draggable: draggableMarker,
        content: markerContent,
        flat: true
    });

    marker.content.className = 'marker-loaded';
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Push items to array and create <li> element in Results sidebar ------------------------------------------------------

function pushItemsToArray(json, a, category, visibleItemsArray){
    var itemPrice;
    visibleItemsArray.push(
        '<li>' +
            '<div class="item" id="' + json.data[a]._id.$id + '">' +
                '<a href="detail.html?' + json.data[a].url + '" class="image">' +
                    '<div class="inner">' +
                        '<div class="item-specific">' +
                            drawItemSpecific(category, json, a) +
                        '</div>' +
                        '<img src="' + json.data[a].gallery[0] + '" alt="">' +
                    '</div>' +
                '</a>' +
                '<div class="wrapper">' +
                    '<a href="detail.html?' + json.data[a].url + '" id="' + json.data[a].id + '"><h3>' + json.data[a].title + '</h3></a>' +
                    '<figure>' + json.data[a].address + '</figure>' +

                    '<div class="info">' +
                        '<div class="type">' +
                            '<i><img src="' + json.data[a].type_icon + '" alt=""></i>' +
                            '<span>' + json.data[a].type_name.vi + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</li>'
    );

    function drawPrice(price){
        if( price ){
            itemPrice = '<div class="price">' + price +  '</div>';
            return itemPrice;
        }
        else {
            return '';
        }
    }
}

// Center map to marker position if function is called (disabled) ------------------------------------------------------

function centerMapToMarker(){
    $.each(json.data, function(a) {
        if( json.data[a].id == id ) {
            var _latitude = json.data[a].latitude;
            var _longitude = json.data[a].longitude;
            var mapCenter = new google.maps.LatLng(_latitude,_longitude);
            map.setCenter(mapCenter);
        }
    });
}

// Create modal if more items are on the same location (example: one building with floors) -----------------------------

function multiChoice(sameLatitude, sameLongitude, json) {
    //if (clickedCluster.getMarkers().length > 1){
        var multipleItems = [];
        $.each(json.data, function(a) {
            if( json.data[a].latitude == sameLatitude && json.data[a].longitude == sameLongitude ) {
                pushItemsToArray(json, a, json.data[a].category_name.vi[0], multipleItems);
            }
        });
        $('body').append('<div class="modal-window multichoice fade_in"></div>');
        $('.modal-window').load( 'assets/external/_modal-multichoice.html', function() {
            $('.modal-window .modal-wrapper .items').html( multipleItems );
            rating('.modal-window');
        });
        $('.modal-window .modal-background, .modal-close').live('click',  function(e){
            $('.modal-window').addClass('fade_out');
            setTimeout(function() {
                $('.modal-window').remove();
            }, 300);
        });
    //}
}

// Animate OSM marker --------------------------------------------------------------------------------------------------

function animateOSMMarkers(map, loadedMarkers, json){
    var bounds = map.getBounds();
    var visibleItemsArray = [];
    var multipleItems = [];

    $.each( loadedMarkers, function (i) {
        if ( bounds.contains( loadedMarkers[i].getLatLng() ) ) {
            //var category = json.data[i].category;
            var category = json.data[i].type_name.vi //QV
            pushItemsToArray(json, i, category, visibleItemsArray);

            setTimeout(function(){
                if( loadedMarkers[i]._icon != null ){
                    loadedMarkers[i]._icon.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-clickable bounce-animation marker-loaded';
                }
            }, i* 50);
        }
        else {
            if( loadedMarkers[i]._icon != null ){
                loadedMarkers[i]._icon.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-clickable';
            }
        }
    });

    // Create list of items in Results sidebar -------------------------------------------------------------------------

    $('.items-list .results').html( visibleItemsArray );

    rating('.results .item');

}

// Redraw map after item list is closed --------------------------------------------------------------------------------

function redrawMap(mapProvider, map){
    $('.map .toggle-navigation').click(function() {
        $('.map-canvas').toggleClass('results-collapsed');
        $('.map-canvas .map').one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
            if( mapProvider == 'osm' ){
                map.invalidateSize();
            }
            else if( mapProvider == 'google' ){
                google.maps.event.trigger(map, 'resize');
            }
        });
    });
}