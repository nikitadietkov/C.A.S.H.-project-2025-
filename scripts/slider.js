$(document).ready(function () {
    if ($(window).width() <= 900) {
        $(".slider").slick({
            autoplaySpeed: 5000,
            vertical: false,
            autoplay: true,
            arrows: false,
            dots: false,
        }) 
    } else {
        $(".slider").slick({
            autoplaySpeed: 5000,
            vertical: true,
            autoplay: true,
            arrows: false,
            dots: true,
            customPaging: function () {
                return '<button type="button">';
            }
        }) 
    }
});