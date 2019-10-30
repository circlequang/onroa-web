var itemID = 1;
$.getJSON('/assets/json/items.json.txt')
	.done(function(json) {
			$.each(json.data, function(a) {
				if( json.data[a].id == itemID ) {
					itemDetailMap(json.data[a]);
				}
			});
			
	})
	.fail(function( jqxhr, textStatus, error ) {
		console.log(error);
	})
;

$(function(){
	var rtl = false; // Use RTL
	initializeOwl(rtl);
	setInterval(runItemdetailSlider, 1000);
	
	//jssor_1_slider_init();
	//var rtl = false; 
	//initializeOwl(rtl);
});

var isRunSlider = false;
function runItemdetailSlider() {
	var src = "";
	try { src = $("#slide_1").attr("src").toString(); } catch(ex) { src = ""; }
	if(src.length > 1) {
		if(isRunSlider == false) {
			clearInterval(runItemdetailSlider);
			jssor_1_slider_init();
			isRunSlider = true;
		}
	}
}

$("#upload").fileinput({
		showUpload: false,
		showCaption: false,
		browseClass: "btn btn-primary btn-lg",
		fileType: "any",
		browseLabel: "Tải hình ảnh",
        previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
		allowedFileExtensions: ["jpg", "png", "gif"]
	});
	
$('.img-wrap .close').on('click', function() {
    var id = $(this).closest('.img-wrap').find('img').data('id');
    alert('remove picture: ' + id);
});

function removeCam(id) {
	alert("remove" + id);
	var el = document.getElementById( 'cam_id_' + id );
	el.parentNode.removeChild( el );
}

//Menu action
$(document).ready(function () {
    //stick in the fixed 100% height behind the navbar but don't wrap it
    $('#slide-nav.navbar-inverse').after($('<div class="inverse" id="navbar-height-col"></div>'));
    $('#slide-nav.navbar-default').after($('<div id="navbar-height-col"></div>'));  

    // Enter your ids or classes
    var toggler = '.navbar-toggle';
    var pagewrapper = '#page-content';
    var navigationwrapper = '.navbar-header';
    var menuwidth = '100%'; // the menu inside the slide menu itself
    var slidewidth = '80%';
    var menuneg = '-100%';
    var slideneg = '-80%';

    $("#slide-nav").on("click", toggler, function (e) {

        var selected = $(this).hasClass('slide-active');

        $('#slidemenu').stop().animate({
            left: selected ? menuneg : '0px'
        });

        $('#navbar-height-col').stop().animate({
            left: selected ? slideneg : '0px'
        });

        $(pagewrapper).stop().animate({
            left: selected ? '0px' : slidewidth
        });

        $(navigationwrapper).stop().animate({
            left: selected ? '0px' : slidewidth
        });

        $(this).toggleClass('slide-active', !selected);
        $('#slidemenu').toggleClass('slide-active');
        $('#page-content, .navbar, body, .navbar-header').toggleClass('slide-active');
    });


    var selected = '#slidemenu, #page-content, body, .navbar, .navbar-header';
    $(window).on("resize", function () {
        if ($(window).width() > 767 && $('.navbar-toggle').is(':hidden')) {
            $(selected).removeClass('slide-active');
        }
    });
});