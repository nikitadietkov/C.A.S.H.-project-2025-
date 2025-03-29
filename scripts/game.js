const url = "./db.json";
let gameState;

if (localStorage.getItem("game")) {
    gameState = JSON.parse(localStorage.getItem("game"));
} else {
    gameState = {
        isGame: false,
        isEnd: false,
        loseEvent: [],
        activeEvent: {},
        task: null,
        data: null,
        money: 4000,
        fatigue: 0,
        historyBalance: [],
        historyFatigue: [],
        endPhrases: []
    };
    getData();
}

checkGame();

$("#money-html").text(`${gameState.money}₴`);
$("#next-task-html").on("click", function () { $(".card-task").hide().fadeIn(300) })

$("#quest-start").on("click", function () {
    $('.main-page').hide();
    $('.card-balance').show();
    getData();
    updateLocalStorage();
    $("#balance-input-range").val(gameState.money);
    $(".card-balance main .text h1").text(`${gameState.money}₴`);
});

$("#balance-input-range").on('input', function () {
    gameState.money = Number($(this).val());
    $(".card-balance main .text h1").text(`${gameState.money}₴`);
    updateLocalStorage();
});

$("#balance-continue").on('click', function () {
    $(".card-balance").hide();
    $(".game").show();
    gameState.historyBalance.push(gameState.money);
    generateTask();
    drawTask();
    gameState.isGame = true;
    updateLocalStorage();
});

$(".final-page main").on("click", function () {
})

function checkGame() {
    if (gameState.isGame) {
        $('.main-page, .card-balance').hide();
        $(".game").show();
        drawTask();
    }
    if (gameState.isEnd) {
        $('.main-page, .card-balance, .game').hide();
        $('.final-page').show()
        drawFinal()
    }
}

function updateLocalStorage() {
    localStorage.setItem("game", JSON.stringify(gameState));
}

async function getData() {
    const response = await fetch(url);
    gameState.data = await response.json();
}

function generateTask() {
    const count = gameState.data.length;
    const randomTask = gameState.data.splice(Math.floor(Math.random() * count), 1)[0];
    gameState.task = randomTask;
    updateLocalStorage();
    drawTask();
}

function drawTask(element = null) {
    const header = `
        <header>
            <img class="logo" src="images/logo/logo-full--white.png" alt="">
            <div class="state-value">
                <h2 id="money-html">${gameState.money}₴</h2>
                <input id="fatique-value-html" value="${gameState.fatigue}" type="text">
            </div>
        </header>`;

    let taskElement = element || `
        <div class="card-task">
            <h2>${gameState.task.event}</h2>
            <div class="choice-html">
                <div class="pos-result-html result-html">
                    <button id="pos-result-value-html" onclick="showDescription(1)">${gameState.task['pos-result-title']}</button>
                </div>
                <div class="neg-result-html result-html">
                    <button id="neg-result-value-html" onclick="showDescription(0)">${gameState.task['neg-result-title']}</button>
                </div>
            </div>
        </div>`;
    $(".game").html(header + taskElement);
    $(".card-task").hide().fadeIn(300);
    drawKnob();
}

function showDescription(id) {
    const choiceType = id ? 'pos' : 'neg';
    const resultTitle = gameState.task[`${choiceType}-result-title`];
    const resultDescription = gameState.task[`${choiceType}-result-description`];

    $(".card-task").html(`
        <h2>${gameState.task.event}</h2>
        <div class="choice-html">
            <div class="${choiceType}-result-html result-html">
                <button id="${choiceType}-result-value-html">${resultTitle}</button>
                <h3 class="${choiceType}-result-descripton-html">${resultDescription}</h3>
            </div>
            <div class="continue">
                <button id="next-task-html" onclick="continueGame('${choiceType}')">ПРОДОВЖИТИ</button>
            </div>
        </div>
    `);
    $(`#${choiceType === 'pos' ? 'neg' : 'pos'}-result-value-html`).prop('disabled', true).hide(200);
    $(`#${choiceType}-result-value-html`).animate({ height: 0, opacity: 0 }, 300, function () {
        $(this).hide();
        $(`.${choiceType}-result-descripton-html`).show().animate({ opacity: 1 }, 300);
        $("#next-task-html").show().animate({ height: '100px', opacity: 1 });
    });
}

function continueGame(choice) {
    updateState(gameState.task[`${choice}-result-value`], gameState.task[`${choice}-fatigue-value`]);
    $(".card-task").fadeOut(300, function () {
        if (gameState.data.length > 0) {
            generateTask();
            $(".card-task").fadeIn(300);
        } else {
            drawFinal('happy');
        }
    });
}

function updateState(moneyVal, fatigueVal) {
    gameState.money += Number(moneyVal);
    gameState.fatigue += Number(fatigueVal);
    gameState.historyBalance.push(gameState.money);
    gameState.historyFatigue.push(gameState.fatigue);
    if (gameState.fatigue < 0) gameState.fatigue = 0;
    if (gameState.money < 0) drawFinal('money')
        else if (gameState.fatigue >= 100) drawFinal('fatigue')
         
}

function generateEndPhrase(event) {
    const moneyEnd = [
        "Гроші закінчилися. Відпочиньте і спробуйте ще раз!",
        "Це не кінець. Збирайтеся з силами!",
        "Фінанси на нулі. Поверніться сильнішими!",
        "Перерва — це нормально. Ви зможете виправити!"
    ];

    const fatigueEnd = [
        "Ваша втома перевищила 100. Відпочиньте і відновіть сили!",
        "Втома досягла межі. Час на перерву!",
        "Ви втомилися. Відновіть сили і спробуйте знову!",
        "Перевищено ліміт втоми. Зробіть паузу!",
        "Втома занадто висока. Час на відпочинок!"
    ];

    const happyEnd = [
        "Вітаємо! Ви завершили гру! Час святкувати!",
        "Ви досягли мети! Чудова робота!",
        "Гру пройдено! Ви справжній переможець!",
        "Вітаємо! Ви подолали всі виклики!",
        "Гра завершена! Дякуємо за участь!"
    ];

    let endPhrases;
    if (event === 'money') {
        endPhrases = moneyEnd;
    } else if (event === 'fatigue') {
        endPhrases = fatigueEnd;
    } else if (event === 'happy') {
        endPhrases = happyEnd;
    }

    const randomIndex = Math.floor(Math.random() * endPhrases.length);
    gameState.endPhrases = endPhrases
    updateLocalStorage()
    return gameState.endPhrases[randomIndex];
}

function drawFinal(loseEvent) {
    $(".final-page .user-hi h3").text(generateEndPhrase(loseEvent))
    gameState.isEnd = true;
    updateLocalStorage()
    $(".game").hide();
    $(".final-page main h1").text(`Твій баланс: ${gameState.money}₴`);
    createHistogram(gameState.historyBalance);
    $(".final-page").show();
}

function createHistogram(data) {
    $('#chart-container').empty();
    const maxValue = Math.max(...data);
    const containerWidth = $(document).width()
    const barWidth = ((containerWidth / data.length) / 35) + "vw";
    console.log(containerWidth);
    
    data.forEach(val => {
        const barHeight = (val / maxValue) * 30 + 1 + "vh";
        $('<div></div>').addClass('bar').css({
            height: barHeight,
            width: barWidth
        }).appendTo('#chart-container');
    });
}

function drawKnob() {
    const knobValue = $("#fatique-value-html").val();
    const colors = ['#009A62', '#49FF00', '#FF9300', '#FF0000'];
    const colorKnobFg = knobValue >= 85 ? colors[3] : knobValue >= 70 ? colors[2] : knobValue >= 50 ? colors[1] : colors[0];

    $("#fatique-value-html").knob({
        min: 0,
        max: 100,
        readOnly: true,
        angleArc: 180,
        thickness: '0.3',
        lineCap: 'round',
        fgColor: colorKnobFg,
    });
}
