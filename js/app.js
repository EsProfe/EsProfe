"use strict";

// =====================================
// EsProfe v0.5.2
// Тренировка + режим теста + фильтры тем
// =====================================

let verbs = [];
let allVerbs = [];
let currentVerb = 0;
let currentPerson = "yo";
let activeVerbFilter = "present";

const persons = ["yo", "tú", "él", "nosotros", "vosotros", "ellos"];
let correctAnswers = 0;
let wrongAnswers = 0;

const TEST_LENGTH = 10;
let testQuestion = 0;
let testCorrect = 0;
let testWrong = 0;
let testActive = false;

async function loadVerbs() {
    try {
        const response = await fetch("data/verbs.json");
        if (!response.ok) throw new Error("Не удалось загрузить verbs.json");
        return await response.json();
    } catch (error) {
        console.error(error);
        const status = document.getElementById("status");
        if (status) status.textContent = translations.loadError || "Ошибка загрузки базы глаголов.";
        return [];
    }
}

function getRandomPerson() {
    return persons[Math.floor(Math.random() * persons.length)];
}

function showVerb() {
    if (verbs.length === 0) return;

    if (currentVerb >= verbs.length) currentVerb = 0;

    const verb = verbs[currentVerb];
    const selectedLanguage = document.getElementById("language").value;

    document.getElementById("verb").textContent = verb.infinitive;
    document.getElementById("translation").textContent = verb.translations[selectedLanguage] || verb.translations.ru;
    document.getElementById("person").textContent = currentPerson;
    document.getElementById("answer").value = "";
    document.getElementById("result").textContent = "";
    document.getElementById("result").dataset.type = "";
    document.getElementById("result").dataset.answer = "";
    document.getElementById("answer").focus();
}

function checkAnswer() {
    if (verbs.length === 0) return;

    const verb = verbs[currentVerb];
    const answerInput = document.getElementById("answer");
    const result = document.getElementById("result");
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = verb.present[currentPerson].toLowerCase();

    if (userAnswer === "") {
        result.textContent = translations.emptyAnswer;
        return;
    }

    if (userAnswer === correctAnswer) {
        correctAnswers++;
        result.dataset.type = "correct";
        result.dataset.answer = "";
        result.textContent = `✅ ${translations.correct}`;
    } else {
        wrongAnswers++;
        result.dataset.type = "incorrect";
        result.dataset.answer = verb.present[currentPerson];
        result.textContent = `❌ ${translations.incorrect} ${translations.correctAnswer} ${verb.present[currentPerson]}`;
    }

    updateStatus();
}

function updateStatus() {
    const status = document.getElementById("status");
    if (!status) return;

    status.textContent = `${translations.verbs} ${verbs.length} | ${translations.correctAnswers} ${correctAnswers} | ${translations.wrongAnswers} ${wrongAnswers}`;
}

function nextVerb() {
    if (verbs.length === 0) return;
    currentVerb++;
    if (currentVerb >= verbs.length) currentVerb = 0;
    currentPerson = getRandomPerson();
    showVerb();
}

function startTest() {
    if (verbs.length === 0) return;

    testQuestion = 0;
    testCorrect = 0;
    testWrong = 0;
    testActive = true;

    document.getElementById("trainingMode").style.display = "none";
    document.getElementById("nextVerb").style.display = "none";
    document.getElementById("startTest").style.display = "none";
    document.getElementById("testMode").style.display = "block";
    document.getElementById("testResultScreen").style.display = "none";

    nextTestQuestion();
}

function nextTestQuestion() {
    if (!testActive) return;
    if (testQuestion >= TEST_LENGTH) {
        finishTest();
        return;
    }

    currentVerb = Math.floor(Math.random() * verbs.length);
    currentPerson = getRandomPerson();

    const verb = verbs[currentVerb];
    const selectedLanguage = document.getElementById("language").value;

    document.getElementById("verb").textContent = verb.infinitive;
    document.getElementById("translation").textContent = verb.translations[selectedLanguage] || verb.translations.ru;
    document.getElementById("testPerson").textContent = currentPerson;
    document.getElementById("testProgress").textContent = `${translations.question} ${testQuestion + 1} ${translations.of} ${TEST_LENGTH}`;
    document.getElementById("testAnswer").value = "";
    document.getElementById("testCheck").textContent = translations.check;
    document.getElementById("testResult").textContent = "";
    document.getElementById("testResult").dataset.type = "";
    document.getElementById("testResult").dataset.answer = "";
    document.getElementById("testAnswer").focus();
}

function checkTestAnswer() {
    if (!testActive) return;

    const answerInput = document.getElementById("testAnswer");
    const result = document.getElementById("testResult");
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (userAnswer === "") {
        result.textContent = translations.emptyAnswer;
        return;
    }

    const verb = verbs[currentVerb];
    const correctAnswer = verb.present[currentPerson].toLowerCase();

    if (userAnswer === correctAnswer) {
        testCorrect++;
        result.dataset.type = "correct";
        result.dataset.answer = "";
        result.textContent = `✅ ${translations.correct}`;
    } else {
        testWrong++;
        result.dataset.type = "incorrect";
        result.dataset.answer = verb.present[currentPerson];
        result.textContent = `❌ ${translations.incorrect} ${translations.correctAnswer} ${verb.present[currentPerson]}`;
    }

    testQuestion++;
    setTimeout(nextTestQuestion, 800);
}

function finishTest() {
    testActive = false;
    document.getElementById("testMode").style.display = "none";
    document.getElementById("testResultScreen").style.display = "block";
    document.getElementById("restartTest").textContent = translations.testAgain;
    document.getElementById("backToTraining").textContent = translations.backToTraining;

    const percent = Math.round((testCorrect / TEST_LENGTH) * 100);
    document.getElementById("testFinished").textContent = translations.testFinished;
    document.getElementById("testScore").textContent = `${testCorrect} / ${TEST_LENGTH}`;

    const testPercent = document.getElementById("testPercent");
    testPercent.dataset.percent = percent;
    testPercent.textContent = `${translations.result} ${percent}%`;
}

function restartTest() {
    startTest();
}

function backToTraining() {
    testActive = false;
    document.getElementById("testMode").style.display = "none";
    document.getElementById("testResultScreen").style.display = "none";
    document.getElementById("trainingMode").style.display = "block";
    document.getElementById("nextVerb").style.display = "inline-block";
    document.getElementById("startTest").style.display = "inline-block";
    currentVerb = 0;
    currentPerson = getRandomPerson();
    showVerb();
}

function applyVerbFilter(filter) {
    activeVerbFilter = filter;

    if (filter === "ar" || filter === "er" || filter === "ir") {
        verbs = allVerbs.filter((verb) => verb.group === filter.toUpperCase());
    } else if (filter === "irregular") {
        verbs = allVerbs.filter((verb) => verb.irregular === true);
    } else {
        verbs = [...allVerbs];
    }

    currentVerb = 0;
    currentPerson = getRandomPerson();
    updateStatus();
    showVerb();
}

function handleVerbSubtopic(event) {
    const subtopic = event.detail && event.detail.subtopic;
    if (!subtopic) return;

    if (subtopic === "test") {
        startTest();
        return;
    }

    if (!testActive) {
        applyVerbFilter(subtopic);
    }
}

async function changeLanguage(language) {
    if (typeof loadLanguage === "function") await loadLanguage(language);
    updateStatus();

    if (testActive) {
        const testProgress = document.getElementById("testProgress");
        if (testProgress) testProgress.textContent = `${translations.question} ${testQuestion + 1} ${translations.of} ${TEST_LENGTH}`;
    }

    const testResultScreen = document.getElementById("testResultScreen");
    if (!testActive && testResultScreen && testResultScreen.style.display === "block") {
        const testFinished = document.getElementById("testFinished");
        if (testFinished) testFinished.textContent = translations.testFinished;

        const testPercent = document.getElementById("testPercent");
        if (testPercent && testPercent.dataset.percent) {
            testPercent.textContent = `${translations.result} ${testPercent.dataset.percent}%`;
        }
    }

    if (!testActive) showVerb();
    document.dispatchEvent(new CustomEvent("esprofe:languageChanged"));
}

document.getElementById("checkAnswer").addEventListener("click", checkAnswer);
document.getElementById("nextVerb").addEventListener("click", nextVerb);
document.getElementById("startTest").addEventListener("click", startTest);
document.getElementById("testCheck").addEventListener("click", checkTestAnswer);
document.getElementById("restartTest").addEventListener("click", restartTest);
document.getElementById("backToTraining").addEventListener("click", backToTraining);
document.getElementById("language").addEventListener("change", (event) => changeLanguage(event.target.value));
document.addEventListener("esprofe:subtopic", handleVerbSubtopic);

async function initApp() {
    const languageSelector = document.getElementById("language");
    const selectedLanguage = languageSelector.value || "ru";

    if (typeof loadLanguage === "function") await loadLanguage(selectedLanguage);

    allVerbs = await loadVerbs();
    verbs = [...allVerbs];
    updateStatus();
    currentPerson = getRandomPerson();
    showVerb();
}

// =====================================
// Enter в обычной тренировке
// =====================================

document.getElementById("answer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkAnswer();
});

document.getElementById("testAnswer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkTestAnswer();
});

initApp();
