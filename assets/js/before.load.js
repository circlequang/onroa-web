var $ = jQuery.noConflict();
$(document).ready(function($) {
    "use strict";

    var $body = $('body');

    if( $body.hasClass('navigation-top-header') ) {
        $( ".main-navigation.navigation-top-header" ).load( "assets/external/_navigation.html" );
    }
    else if( $body.hasClass('navigation-off-canvas') ) {
        $( ".main-navigation.navigation-off-canvas" ).load( "assets/external/_navigation.html" );
		}
    mobileNavigation();
    toggleNav();
});

$(window).resize(function(){
    mobileNavigation();
});

// Navigation on small screen ------------------------------------------------------------------------------------------

function mobileNavigation(){
    if( $(window).width() < 979 ){
        $(".main-navigation.navigation-top-header").remove();
        $(".toggle-navigation").css("display","inline-block");
        $(".main-navigation.navigation-off-canvas").load("assets/external/_navigation.html");
        $("body").removeClass("navigation-top-header");
        $("body").addClass("navigation-off-canvas");
    }
}

// Toggle off canvas navigation ----------------------------------------------------------------------------------------

function toggleNav() {

    if( $('body').hasClass('navigation-off-canvas') ){
        $('.header .toggle-navigation').click(function() {
            $('#outer-wrapper').toggleClass('show-nav');
        });
        $('#page-content').click(function() {
            $('#outer-wrapper').removeClass('show-nav');
        });
    }

}

 //Google Analyze
 (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-89784140-1', 'auto');
  ga('send', 'pageview');