"use strict";

let translations = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error(`Не удалось загрузить язык: ${lang}`);

        translations = await response.json();

        const title = document.getElementById("title");
        if (title && translations.title) title.textContent = translations.title;

        const subtitle = document.getElementById("subtitle");
        if (subtitle && translations.subtitle) subtitle.textContent = translations.subtitle;

        const verb = document.getElementById("verb");
        if (verb && translations.loading) verb.textContent = translations.loading;

        const nextVerb = document.getElementById("nextVerb");
        if (nextVerb && translations.next) nextVerb.textContent = translations.next;

        const answer = document.getElementById("answer");
        if (answer && translations.answerPlaceholder) answer.placeholder = translations.answerPlaceholder;

        const checkAnswer = document.getElementById("checkAnswer");
        if (checkAnswer && translations.check) checkAnswer.textContent = translations.check;

        const startTest = document.getElementById("startTest");
        if (startTest && translations.startTest) startTest.textContent = translations.startTest;

        const testCheck = document.getElementById("testCheck");
        if (testCheck && translations.check) testCheck.textContent = translations.check;

        const restartTest = document.getElementById("restartTest");
        if (restartTest && translations.testAgain) restartTest.textContent = translations.testAgain;

        const backToTraining = document.getElementById("backToTraining");
        if (backToTraining && translations.backToTraining) backToTraining.textContent = translations.backToTraining;

        const testAnswer = document.getElementById("testAnswer");
        if (testAnswer && translations.answerPlaceholder) testAnswer.placeholder = translations.answerPlaceholder;

        const status = document.getElementById("status");
        if (status && translations.statusLoading) status.textContent = translations.statusLoading;

        const footer = document.querySelector("footer");
        if (footer && translations.footer) footer.textContent = translations.footer;

        const testFinished = document.getElementById("testFinished");
        if (testFinished && translations.testFinished) testFinished.textContent = translations.testFinished;

        const testPercent = document.getElementById("testPercent");
        if (testPercent && testPercent.dataset.percent && translations.result) {
            testPercent.textContent = `${translations.result} ${testPercent.dataset.percent}%`;
        }

        const result = document.getElementById("result");
        if (result && result.dataset.type === "correct" && translations.correct) {
            result.textContent = `✅ ${translations.correct}`;
        }
        if (result && result.dataset.type === "incorrect") {
            result.textContent = `❌ ${translations.incorrect} ${translations.correctAnswer} ${result.dataset.answer}`;
        }

        const testResult = document.getElementById("testResult");
        if (testResult && testResult.dataset.type === "correct" && translations.correct) {
            testResult.textContent = `✅ ${translations.correct}`;
        }
        if (testResult && testResult.dataset.type === "incorrect") {
            testResult.textContent = `❌ ${translations.incorrect} ${translations.correctAnswer} ${testResult.dataset.answer}`;
        }

        if (typeof updateTopicTexts === "function") updateTopicTexts();
    } catch (error) {
        console.error("Ошибка загрузки языка:", error);
    }
}
