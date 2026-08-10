"use strict";

// =====================================
// EsProfe v0.4.0
// Тренировка + режим теста
// =====================================

let verbs = [];
let currentVerb = 0;
let currentPerson = "yo";

const persons = [
    "yo",
    "tú",
    "él",
    "nosotros",
    "vosotros",
    "ellos"
];

let correctAnswers = 0;
let wrongAnswers = 0;


// =====================================
// Переменные теста
// =====================================

const TEST_LENGTH = 10;

let testQuestion = 0;
let testCorrect = 0;
let testWrong = 0;
let testActive = false;


// =====================================
// Загрузка базы глаголов
// =====================================

async function loadVerbs() {

    try {

        const response =
            await fetch("data/verbs.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить verbs.json");
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        const status =
            document.getElementById("status");

        if (status) {
            status.textContent =
                "Ошибка загрузки базы глаголов.";
        }

        return [];

    }
}


// =====================================
// Случайное лицо
// =====================================

function getRandomPerson() {

    const randomIndex =
        Math.floor(Math.random() * persons.length);

    return persons[randomIndex];

}


// =====================================
// Показ текущего глагола
// =====================================

function showVerb() {

    if (verbs.length === 0) {
        return;
    }

    const verb =
        verbs[currentVerb];

    const selectedLanguage =
        document.getElementById("language").value;


    document.getElementById("verb").textContent =
        verb.infinitive;


    document.getElementById("translation").textContent =
        verb.translations[selectedLanguage] ||
        verb.translations.ru;


    document.getElementById("person").textContent =
        currentPerson;


    document.getElementById("answer").value = "";


    document.getElementById("result").textContent = "";


    document.getElementById("answer").focus();

}


// =====================================
// Проверка обычной тренировки
// =====================================

function checkAnswer() {

    if (verbs.length === 0) {
        return;
    }

    const verb =
        verbs[currentVerb];

    const answerInput =
        document.getElementById("answer");

    const result =
        document.getElementById("result");


    const userAnswer =
        answerInput.value.trim().toLowerCase();


    const correctAnswer =
        verb.present[currentPerson].toLowerCase();


    if (userAnswer === "") {

        result.textContent =
            translations.emptyAnswer;

        return;

    }


    if (userAnswer === correctAnswer) {

        correctAnswers++;

        result.textContent =
            `✅ ${translations.correct}`;

    } else {

        wrongAnswers++;

        result.textContent =
            `❌ ${translations.incorrect} ` +
            `${translations.correctAnswer} ` +
            `${verb.present[currentPerson]}`;

    }


    updateStatus();

}


// =====================================
// Статистика тренировки
// =====================================

function updateStatus() {

    const status =
        document.getElementById("status");

    if (!status) {
        return;
    }

    status.textContent =
        `${translations.verbs} ${verbs.length} | ` +
        `${translations.correctAnswers} ${correctAnswers} | ` +
        `${translations.wrongAnswers} ${wrongAnswers}`;

}


// =====================================
// Следующий глагол
// =====================================

function nextVerb() {

    if (verbs.length === 0) {
        return;
    }


    currentVerb++;

    if (currentVerb >= verbs.length) {
        currentVerb = 0;
    }


    currentPerson =
        getRandomPerson();


    showVerb();

}


// =====================================
// Запуск теста
// =====================================

function startTest() {

    if (verbs.length === 0) {
        return;
    }


    testQuestion = 0;
    testCorrect = 0;
    testWrong = 0;

    testActive = true;


    // Скрываем тренировку

    document.getElementById("trainingMode").style.display =
        "none";


    document.getElementById("nextVerb").style.display =
        "none";


    document.getElementById("startTest").style.display =
        "none";


    // Показываем тест

    document.getElementById("testMode").style.display =
        "block";


    document.getElementById("testResultScreen").style.display =
        "none";


    nextTestQuestion();

}


// =====================================
// Следующий вопрос теста
// =====================================

function nextTestQuestion() {

    if (!testActive) {
        return;
    }


    // Проверяем окончание теста

    if (testQuestion >= TEST_LENGTH) {

        finishTest();

        return;

    }


    // Случайный глагол

    currentVerb =
        Math.floor(Math.random() * verbs.length);


    // Случайное лицо

    currentPerson =
        getRandomPerson();


    const verb =
        verbs[currentVerb];


    const selectedLanguage =
        document.getElementById("language").value;


    document.getElementById("verb").textContent =
        verb.infinitive;


    document.getElementById("translation").textContent =
        verb.translations[selectedLanguage] ||
        verb.translations.ru;


    document.getElementById("testPerson").textContent =
        currentPerson;


    document.getElementById("testProgress").textContent =
        `${translations.question} ${testQuestion + 1} ${translations.of} ${TEST_LENGTH}`;


    document.getElementById("testAnswer").value =
        "";


    document.getElementById("testResult").textContent =
        "";


    document.getElementById("testAnswer").focus();

}


// =====================================
// Проверка ответа теста
// =====================================

function checkTestAnswer() {

    if (!testActive) {
        return;
    }


    const answerInput =
        document.getElementById("testAnswer");

    const result =
        document.getElementById("testResult");


    const userAnswer =
        answerInput.value.trim().toLowerCase();


    if (userAnswer === "") {

        result.textContent =
            translations.emptyAnswer;

        return;

    }


    const verb =
        verbs[currentVerb];


    const correctAnswer =
        verb.present[currentPerson].toLowerCase();


    if (userAnswer === correctAnswer) {

        testCorrect++;

        result.textContent =
            `✅ ${translations.correct}`;

    } else {

        testWrong++;

        result.textContent =
            `❌ ${translations.incorrect} ` +
            `${translations.correctAnswer} ` +
            `${verb.present[currentPerson]}`;

    }


    testQuestion++;


    // Небольшая задержка перед следующим вопросом

    setTimeout(() => {

        nextTestQuestion();

    }, 800);

}


// =====================================
// Завершение теста
// =====================================

function finishTest() {

    testActive = false;


    document.getElementById("testMode").style.display =
        "none";


    document.getElementById("testResultScreen").style.display =
        "block";


    const percent =
        Math.round(
            (testCorrect / TEST_LENGTH) * 100
        );


    document.getElementById("testFinished").textContent =
        translations.testFinished;


    document.getElementById("testScore").textContent =
        `${testCorrect} / ${TEST_LENGTH}`;


    document.getElementById("testPercent").textContent =
        `${translations.result}: ${percent}%`;

}


// =====================================
// Повторить тест
// =====================================

function restartTest() {

    startTest();

}


// =====================================
// Вернуться к тренировке
// =====================================

function backToTraining() {

    testActive = false;


    document.getElementById("testMode").style.display =
        "none";


    document.getElementById("testResultScreen").style.display =
        "none";


    document.getElementById("trainingMode").style.display =
        "block";


    document.getElementById("nextVerb").style.display =
        "inline-block";


    document.getElementById("startTest").style.display =
        "inline-block";


    currentVerb = 0;

    currentPerson = getRandomPerson();


    showVerb();

}


// =====================================
// Переключение языка
// =====================================

async function changeLanguage(language) {

    if (typeof loadLanguage === "function") {

        await loadLanguage(language);

    }


    updateStatus();


    if (testActive) {

        document.getElementById("testProgress").textContent =
            `${translations.question} ${testQuestion + 1} ` +
            `${translations.of} ${TEST_LENGTH}`;

    }


    if (!testActive) {

        showVerb();

    }

}


// =====================================
// Инициализация
// =====================================

async function initApp() {

    const languageSelector =
        document.getElementById("language");


    const selectedLanguage =
        languageSelector.value || "ru";


    if (typeof loadLanguage === "function") {

        await loadLanguage(selectedLanguage);

    }


    verbs =
        await loadVerbs();


    updateStatus();


    currentPerson =
        getRandomPerson();


    showVerb();

}


// =====================================
// Обработчики
// =====================================


// Проверка обычной тренировки

document
    .getElementById("checkAnswer")
    .addEventListener(
        "click",
        checkAnswer
    );


// Следующий глагол

document
    .getElementById("nextVerb")
    .addEventListener(
        "click",
        nextVerb
    );


// Запуск теста

document
    .getElementById("startTest")
    .addEventListener(
        "click",
        startTest
    );


// Проверка теста

document
    .getElementById("testCheck")
    .addEventListener(
        "click",
        checkTestAnswer
    );


// Повтор теста

document
    .getElementById("restartTest")
    .addEventListener(
        "click",
        restartTest
    );


// Возврат к тренировке

document
    .getElementById("backToTraining")
    .addEventListener(
        "click",
        backToTraining
    );


// Переключение языка

document
    .getElementById("language")
    .addEventListener(
        "change",
        (event) => {

            changeLanguage(
                event.target.value
            );

        }
    );


// Enter в обычной тренировке

document
    .getElementById("answer")
    .addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                checkAnswer();

            }

        }
    );


// Enter в тесте

document
    .getElementById("testAnswer")
    .addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                checkTestAnswer();

            }

        }
    );


// =====================================
// Запуск приложения
// =====================================

initApp();