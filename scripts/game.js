const url = "./db.json"
// const headers = {
//     "content-type": "application/json",
//     "x-apikey": "67d5cc52a6de009d7180cb5d",
//     "cache-control": "no-cache"
// }






let gameState;

if (localStorage.getItem("game")) {
    gameState = JSON.parse(localStorage.getItem("game"));
} else { 
    gameState = {
        isGame: false,
        loseEvent: [],
        activeEvent: {},
        task: null,
        data: null,
        money: 4000,
        fatigue: 0,
        historyBalance: [],
        historyFatigue: []
    }
    getData()
}






checkGame()



$("#money-html").text(gameState.money + "₴")
$("#quest-start").on("click", function () {
    $('.main-page').hide();
    $('.card-balance').show()
    getData();
    updateLocalStorage();
    $("#balance-input-range").val(gameState.money)
    $(".card-balance main .text h1").text(gameState.money + "₴");
})

$("#balance-input-range").on('input', function () {
    gameState.money = Number($("#balance-input-range").val())
    $(".card-balance main .text h1").text(gameState.money + "₴");
    updateLocalStorage()
})

$("#balance-continue").on('click', function () {
    $(".card-balance").hide();
    $(".game").show();
    gameState.historyBalance.push(gameState.money)
    generateTask();
    drawTask()
    gameState.isGame = true;
    updateLocalStorage();
})






function checkGame() {
    if (gameState.isGame) {
        $('.main-page').hide();
        $(".card-balance").hide();
        $(".game").show();
        drawTask()
    }  
}
function updateLocalStorage() {
    localStorage.setItem("game", JSON.stringify(gameState))
}

function getData() {
    
    fetch(url)
        .then(async function (response) {
            let data = await response.json()
            gameState.data = data
            console.log(data)
        })
    }


function generateTask() {
    let count = gameState.data.length;

    let randomTask = gameState.data[Math.floor(Math.random() * count)];
    gameState.task = randomTask;

    let indexToRemove = gameState.data.indexOf(randomTask);
    if (indexToRemove !== -1) {
        gameState.data.splice(indexToRemove, 1);
    }
    updateLocalStorage();

    // Обновляем интерфейс с новой задачей
    drawTask();
}


function drawTask(element) {
    let header = `
        <header>
            <img class="logo" src="images/logo/logo-full--white.png" alt="">
            <div class="state-value">
                <h2 id="money-html">${gameState.money + "₴"}</h2>
                <input id="fatique-value-html" value="${gameState.fatigue}" type="text">
            </div>
        </header>`;

    let taskElement;
    if (element === undefined) {
        taskElement = `
        <div class="card-task">
            <h2>${gameState.task.event}</h2>
            <div class="choice-html">
                <div class="pos-result-html result-html">
                    <button id="pos-result-value-html" onclick="showDescription('pos')">${gameState.task['pos-result-title']}</button>
                </div>
                <div class="neg-result-html result-html">
                    <button id="neg-result-value-html" onclick="showDescription('neg')">${gameState.task['neg-result-title']}</button>
                </div>
            </div>
        </div>`;
    } else {
        taskElement = element;
    }

    $(".game").html(header + taskElement);

    drawKnob();
}

function showDescription(id) {
    if (id === "pos") {
        drawTask(`
            <div class="card-task">
            <h2>${gameState.task.event}</h2>
            <div class="choice-html">
            <div class="pos-result-html result-html">
            <button id="pos-result-value-html">${gameState.task['pos-result-title']}</button>
            <h3 class="pos-result-descripton-html">${gameState.task['pos-result-description']}</h3>
            </div>
            <div class="continue">
            <button id="next-task-html" onclick="continueGame('pos')">ПРОДОВЖИТИ</button>
            </div>
            </div>
            </div>`);
            $("#neg-result-value-html").prop('disabled', true).hide(200);
            $("#pos-result-value-html").animate({ height: 0, opacity: 0 }, 300, function () {
            $(this).css('display', 'none');
                $(".pos-result-descripton-html").css('display', 'block').animate({ opacity: 1 }, 300);
                
                $("#next-task-html").show().animate({
                    height: '100px',
                    opacity: 1
                })
        });
    } else {
        $("#pos-result-value-html").prop('disabled', true).hide(200);
        $("#neg-result-value-html").animate({ height: 0, opacity: 0 }, 300, function () {
            $(this).css('display', 'none');
            $(".neg-result-descripton-html").css('display', 'block').animate({ opacity: 1 }, 300);
            drawTask(`
                <div class="card-task">
                    <h2>${gameState.task.event}</h2>
                    <div class="choice-html">
                        <div class="neg-result-html result-html">
                            <button id="neg-result-value-html">${gameState.task['neg-result-title']}</button>
                            <h3 class="neg-result-descripton-html">${gameState.task['neg-result-description']}</h3>
                        </div>
                        <div class="continue">
                            <button id="next-task-html" onclick="continueGame('neg')">ПРОДОВЖИТИ</button>
                        </div>
                    </div>
                </div>`);
        });
    }
}

function continueGame(choice) {
    if (choice === 'pos') {
        updateState(gameState.task['pos-result-value'], gameState.task['pos-fatigue-value']);
    } else {
        updateState(gameState.task['neg-result-value'], gameState.task['neg-fatigue-value']);
    }

    // Генерируем новую задачу и обновляем интерфейс
    if (gameState.data.length > 0) {
        generateTask();
        drawTask();
    } else {
        drawFinal();
    }
}

function plusMoney(value) {
    gameState.money += Number(value)
    gameState.historyBalance.push(gameState.money)
    if (gameState.data.length > 0) {
        generateTask()
        drawTask()
    } else if (Number(gameState.money) < 0) {
        drawFinal()
    } else {
        drawFinal()
    }
}

function plusFatigue(value) {
    gameState.fatigue += Number(value)
    gameState.historyFatigue.push(gameState.fatigue)
    if (gameState.fatigue < 0) {
        gameState.fatigue = 0
    }
}

function updateState(moneyVal, fatigueVal) {
    plusFatigue(fatigueVal)
    plusMoney(moneyVal)
    if (gameState.money < 0) {
        drawFinal();
    } else if (gameState.fatigue >= 100) {
        drawFinal()
    }
}

function drawFinal() {
    $(".game").hide();
    $(".final-page main h1").text("Твій баланс: " + gameState.money + "₴");
    createHistogram(gameState.historyBalance);
    $(".final-page").show();
    
    // localStorage.clear();
}

function createHistogram(data) {
    $('#chart-container').empty(); 
    const maxValue = Math.max(...data);
    
    $.each(data, function (index, val) {
        const barWidth = ($(".final-page main").width / data.length)
        const barHeight = (val / maxValue) * 10; 
        const bar = $('<div></div>')
        .addClass('bar')
        .css("height", barHeight + 'em')
        $('#chart-container').append(bar); 
    });
}
function drawKnob() {
    let colorKnobFg = '#009A62'
    let knobValue = $("#fatique-value-html").val()
    if (knobValue >= 85) {
        colorKnobFg = '#FF0000';
    } else if (knobValue >= 70) {
        colorKnobFg = '#FF9300';
    } else if (knobValue >= 50) {
        colorKnobFg = '#49FF00';
    } else {
        colorKnobFg = '#009A62'
    }
    
    $("#fatique-value-html").knob({
        'min': 0,
        'max': 100,
        'readOnly': true,
        'angleArc': 180,
        'thickness': '0.3',
        'lineCap': 'round',
        'fgColor': colorKnobFg,
    })
}