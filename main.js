jQuery(window).on('load', function() {
	"use strict";
    setTimeout(function(){
        $(".preloader").addClass("hide-preloader");
    }, 300 );
});

jQuery(document).ready(function($) {
	"use strict";
    // SMOOTH SCROLL FOR SAME PAGE LINKS
    $(document).on('click', 'a.smooth-scroll', function(event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $( $.attr(this, 'href') ).offset().top
        }, 500);
    });
    window.sr = ScrollReveal();
    sr.reveal(".scroll-animated", {
        duration: 600,
        delay: 0,
        origin: "left",
        rotate: { x: 0, y: 0, z: 0 },
        opacity: 0,
        distance: "20vh",
        viewFactor: 0.4,
        scale: 1,
    });
});
