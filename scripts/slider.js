$(document).ready(function () {
    $(".slider").slick({
        autoplaySpeed: 3000,
        vertical: true,
        autoplay: true,
        arrows: false,
        dots: true,
        customPaging: function() {
            return '<button type="button">';
        }
   }) 
});