let gameState = {
    money: 0,
    isGame: false,
    loseEvent: [],
    activeEvent: {}
}


$(document).ready(function () {
    gameStart()
    gameState = JSON.parse(localStorage.getItem("game"))
    if (gameState.isGame) {
        $(".slider").hide()
    }
});

function gameStart() {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://project-face.restdb.io/rest/task-list",
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": "67d5cc52a6de009d7180cb5d",
            "cache-control": "no-cache"
        }
    }

    $.ajax(settings).done(function (response) {
        response.forEach(el => {
            console.log(el);
            
        });
    });

    localStorage.setItem("game", JSON.stringify(gameState))
}
