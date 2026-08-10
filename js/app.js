"use strict";

// =====================================
// EsProfe v0.3.0
// Интерактивный тренажёр спряжения
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
// Загрузка базы глаголов
// =====================================

async function loadVerbs() {

    try {

        const response =
            await fetch("data/verbs.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить verbs.json");
        }

        const data =
            await response.json();

        return data;

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


    // Инфинитив

    document.getElementById("verb").textContent =
        verb.infinitive;


    // Перевод

    document.getElementById("translation").textContent =
        verb.translations[selectedLanguage] ||
        verb.translations.ru;


    // Лицо

    document.getElementById("person").textContent =
        currentPerson;


    // Очистить поле ответа

    document.getElementById("answer").value = "";


    // Очистить результат

    document.getElementById("result").textContent = "";


    // Фокус на поле

    document.getElementById("answer").focus();

}


// =====================================
// Проверка ответа
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
        answerInput.value
            .trim()
            .toLowerCase();


    const correctAnswer =
        verb.present[currentPerson]
            .toLowerCase();


    // Пустой ответ

    if (userAnswer === "") {

        result.textContent =
            translations.emptyAnswer;

        return;

    }


    // Правильный ответ

    if (userAnswer === correctAnswer) {

        correctAnswers++;

        result.textContent =
            `✅ ${translations.correct}`;

    }


    // Неправильный ответ

    else {

        wrongAnswers++;

        result.textContent =
            `❌ ${translations.incorrect} ` +
            `${translations.correctAnswer} ` +
            `${verb.present[currentPerson]}`;

    }


    updateStatus();

}


// =====================================
// Статистика
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


    // Следующий глагол

    currentVerb++;

    if (currentVerb >= verbs.length) {
        currentVerb = 0;
    }


    // Случайное лицо

    const randomPerson =
        Math.floor(
            Math.random() * persons.length
        );

    currentPerson =
        persons[randomPerson];


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

    showVerb();

}


// =====================================
// Инициализация приложения
// =====================================

async function initApp() {

    const languageSelector =
        document.getElementById("language");


    const selectedLanguage =
        languageSelector.value || "ru";


    // Загружаем язык

    if (typeof loadLanguage === "function") {

        await loadLanguage(selectedLanguage);

    }


    // Загружаем глаголы

    verbs =
        await loadVerbs();


    // Показываем статистику

    updateStatus();


    // Показываем первый глагол

    showVerb();

}


// =====================================
// Обработчики событий
// =====================================


// Проверка ответа

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


// Enter = проверить ответ

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


// =====================================
// Запуск приложения
// =====================================

initApp();