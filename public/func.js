$(document).ready(function() {
    $('.counter').each(function () {
        $(this).prop('Counter',0).animate(
            { Counter: $(this).text()}, { 
                duration: 4000,easing: 'swing',step: function (now) {
                    $(this).text(Math.ceil(now));
                }
        });
    });
});

// Sign in 
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Sign in 
var modal = document.getElementById('id02');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}