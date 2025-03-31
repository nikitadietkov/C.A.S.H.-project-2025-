// Вказуємо URL для отримання даних
const url = "./db.json";
let gameState;

// Перевіряємо, чи є збережений стан гри в localStorage
if (localStorage.getItem("game")) {
    gameState = JSON.parse(localStorage.getItem("game")); // Завантажуємо стан гри
} else {
    // Ініціалізуємо початковий стан гри
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
    getData(); // Отримуємо дані для гри
}

// Перевіряємо стан гри
checkGame();

// Оновлюємо відображення грошей на сторінці
$("#money-html").text(`${gameState.money}₴`);

// Обробник для кнопки "Наступне завдання"
$("#next-task-html").on("click", function () {
    $(".card-task").hide().fadeIn(300); // Плавно показуємо завдання
});

// Обробник для початку гри
$("#quest-start").on("click", function () {
    $('.main-page').hide(); // Сховати головну сторінку
    $('.card-balance').show(); // Показати сторінку балансу
    getData(); // Отримати дані
    updateLocalStorage(); // Оновити localStorage
    $("#balance-input-range").val(gameState.money); // Встановити значення повзунка
    $(".card-balance main .text h1").text(`${gameState.money}₴`); // Оновити відображення грошей
});

// Обробник для зміни значення балансу
$("#balance-input-range").on('input', function () {
    gameState.money = Number($(this).val()); // Зберегти нове значення грошей
    $(".card-balance main .text h1").text(`${gameState.money}₴`); // Оновити відображення
    updateLocalStorage(); // Оновити localStorage
});

// Обробник для продовження гри
$("#balance-continue").on('click', function () {
    $(".card-balance").hide(); // Сховати сторінку балансу
    $(".game").show(); // Показати сторінку гри
    gameState.historyBalance.push(gameState.money); // Додати поточний баланс в історію
    generateTask(); // Згенерувати нове завдання
    drawTask(); // Намалювати завдання
    gameState.isGame = true; // Встановити, що гра активна
    updateLocalStorage(); // Оновити localStorage
});

$("#restart-button").on("click", function () {
    location.reload()
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

    // Показати вибір балансу
    $('.final-page').hide();
    $('.main-page').hide();
    $('.card-balance').show();
    $("#balance-input-range").val(gameState.money);
    $(".card-balance main .text h1").text(`${gameState.money}₴`);
    updateLocalStorage()
});

// Перемикач для відображення статистики
let isActiveHisto = true;
$(".final-page main .statistic").on("click", function () {
    if (isActiveHisto) {
        $(".final-page main .head h2").fadeOut(300, function () {
            $(this).text('Твій прогрес втоми під час гри').fadeIn(300);
        });
        createHistogram(gameState.historyFatigue); // Створити гістограму втоми
        isActiveHisto = false; // Переключитися на втомленість
    } else {
        $(".final-page main .head h2").fadeOut(300, function () {
            $(this).text('Твій фінансовий прогрес під час гри').fadeIn(300);
        });
        createHistogram(gameState.historyBalance); // Створити гістограму балансу
        isActiveHisto = true; // Переключитися на баланс
    }
});

// Функція для перевірки стану гри
function checkGame() {
    if (gameState.isGame) {
        $('.main-page, .card-balance').hide(); // Сховати головну та баланс
        $(".game").show(); // Показати гру
        drawTask(); // Намалювати завдання
    }
    if (gameState.isEnd) {
        $('.main-page, .card-balance, .game').hide(); // Сховати всі інші елементи
        $('.final-page').show(); // Показати фінальну сторінку
        drawFinal(); // Намалювати фінал
    }
}

// Функція для оновлення localStorage
function updateLocalStorage() {
    localStorage.setItem("game", JSON.stringify(gameState)); // Зберегти стан гри
}

// Асинхронна функція для отримання даних
async function getData() {
    const response = await fetch(url); // Отримати дані з URL
    gameState.data = await response.json(); // Зберегти дані в стан гри
}

// Функція для генерації нового завдання
function generateTask() {
    const count = gameState.data.length;
    const randomTask = gameState.data.splice(Math.floor(Math.random() * count), 1)[0]; // Випадкове завдання
    gameState.task = randomTask; // Зберегти завдання в стан
    updateLocalStorage(); // Оновити localStorage
    drawTask(); // Намалювати завдання
}

// Функція для малювання завдання
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
    $(".game").html(header + taskElement); // Додати заголовок та елемент завдання
    $(".card-task").hide().fadeIn(300); // Показати завдання з анімацією
    drawKnob(); // Намалювати контрольну ручку
}

// Функція для показу опису вибору
function showDescription(id) {
    const choiceType = id ? 'pos' : 'neg'; // Визначити тип вибору
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

// Функція для продовження гри після вибору
function continueGame(choice) {
    updateState(gameState.task[`${choice}-result-value`], gameState.task[`${choice}-fatigue-value`]);
    $(".card-task").fadeOut(300, function () {
        if (gameState.data.length > 0) {
            generateTask(); // Згенерувати нове завдання, якщо є
            $(".card-task").fadeIn(300); // Показати нове завдання
        } else {
            drawFinal('happy'); // Намалювати фінал, якщо завдань більше немає
        }
    });
}

// Функція для оновлення стану гри
function updateState(moneyVal, fatigueVal) {
    gameState.money += Number(moneyVal); // Оновити гроші
    gameState.fatigue += Number(fatigueVal); // Оновити втому
    gameState.historyBalance.push(gameState.money); // Додати до історії балансу
    gameState.historyFatigue.push(gameState.fatigue); // Додати до історії втоми
    if (gameState.fatigue < 0) gameState.fatigue = 0; // Не дозволяти від'ємну втому
    if (gameState.money < 0) drawFinal('money'); // Якщо гроші вичерпалися, показати фінал
    else if (gameState.fatigue >= 100) drawFinal('fatigue'); // Якщо втома перевищує 100, показати фінал
}

// Функція для генерації фінальної фрази
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

    let endPhrases = [];
    if (event === 'money') {
        endPhrases = moneyEnd; // Вибір фрази для випадку з грошима
    } else if (event === 'fatigue') {
        endPhrases = fatigueEnd; // Вибір фрази для випадку з втомою
    } else if (event === 'happy') {
        endPhrases = happyEnd; // Вибір фрази для успішного завершення
    }

    if (endPhrases.length === 0) {
        console.error("endPhrases: 404");
        return "Щось пішло не так. Спробуйте знову!"; // Помилка
    }

    const randomIndex = Math.floor(Math.random() * endPhrases.length);
    const finalPhrase = endPhrases[randomIndex]; // Випадкова фраза

    gameState.endPhrase = finalPhrase; // Зберегти фінальну фразу
    updateLocalStorage(); // Оновити localStorage
    return finalPhrase; // Повернути фінальну фразу
}

// Функція для малювання фінальної сторінки
function drawFinal(loseEvent) {
    if (!gameState.endPhrase) {
        gameState.endPhrase = generateEndPhrase(loseEvent); // Згенерувати фінальну фразу
    }

    $(".final-page .user-hi h3").text(gameState.endPhrase); // Відобразити фінальну фразу
    gameState.isEnd = true; // Встановити, що гра закінчена
    updateLocalStorage(); // Оновити localStorage

    $(".game").hide(); // Сховати гру
    $(".final-page main h1").text(`Твій баланс: ${gameState.money}₴`); // Показати баланс
    createHistogram(gameState.historyBalance); // Створити гістограму балансу
    $(".final-page").show(); // Показати фінальну сторінку
}

// Функція для створення гістограми
function createHistogram(data) {
    $('#chart-container').empty(); // Очищаем контейнер
    const maxValue = Math.max(...data);
    const containerWidth = $(window).width();
    const isMobile = containerWidth < 600;
    const isBalance = data == gameState.historyBalance;

    data.forEach((val, index) => {
        const barHeight = isMobile ? "20px" : (val / maxValue) * 30 + 'vh';
        const barLength = isMobile ? (val / maxValue) * (containerWidth - 80) + "px" : (containerWidth / data.length) / 40 + 'vw';
        const minVal = val < 1000; 

        if (isBalance) {
            var $bar = $(`<div class="histogram-bar" style="width: 0; height: ${barHeight};"><h2>${val}</h2></div>`).css({
                backgroundColor: index % 2 === 0 ? '#205781' : '#4F959D',
                display: 'flex',
                alignItems: isMobile ? 'center' : 'flex-start',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                color: '#fff',
                fontSize: isMobile ? '60%' : '70%',
                transition: 'width 0.5s ease',
                padding: isMobile ? minVal ? '0 0 0 10px' : 0 : 0,
                borderRadius: isMobile ? '5px 0 0 5px' : '5px 5px 0 0',
            });
        } else {
            $bar = $(`<div class="histogram-bar" style="width: 0; height: ${barHeight};"><h2>${val}</h2></div>`).css({
                backgroundColor: index % 2 === 0 ? '#FE4F2D' : '#015551',
                display: 'flex',
                alignItems: isMobile ? 'center' : 'flex-start',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                color: '#fff',
                minWidth: '5%',
                padding: isMobile ? '0 0 0 5px' : 0,
                borderRadius: isMobile ? '5px 0 0 5px' : '5px 5px 0 0',
                fontSize: isMobile ? '60%' : '100%',
                transition: 'width 0.5s ease',
                
            });
        }
        
        
        $('#chart-container').append($bar);

        setTimeout(() => {
            $bar.css('width', barLength);
        }, 10);
    });

    $('.histogram-bar h2').css({
        width: isMobile ? 'auto' : '100%'
    });
}

// Функція для малювання контрольної ручки
function drawKnob() {
    const knobValue = $("#fatique-value-html").val(); // Отримати значення втоми
    const colors = ['#009A62', '#49FF00', '#FF9300', '#FF0000']; // Кольори для контрольної ручки
    const colorKnobFg = knobValue >= 85 ? colors[3] : knobValue >= 70 ? colors[2] : knobValue >= 50 ? colors[1] : colors[0]; // Визначити колір

    $("#fatique-value-html").knob({
        min: 0,
        max: 100,
        readOnly: true,
        angleArc: 180,
        thickness: '0.3',
        lineCap: 'round',
        fgColor: colorKnobFg, // Колір контрольної ручки
    });
}