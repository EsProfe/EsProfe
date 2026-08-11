"use strict";

let translations = {};

async function loadLanguage(lang) {

    try {

        const response =
            await fetch(`locales/${lang}.json`);

        if (!response.ok) {
            throw new Error(
                `Не удалось загрузить язык: ${lang}`
            );
        }

        translations =
            await response.json();


        // =====================================
        // Основной интерфейс
        // =====================================

        const title =
            document.getElementById("title");

        if (title) {
            title.textContent =
                translations.title;
        }


        const subtitle =
            document.getElementById("subtitle");

        if (subtitle) {
            subtitle.textContent =
                translations.subtitle;
        }


        const nextVerb =
            document.getElementById("nextVerb");

        if (nextVerb) {
            nextVerb.textContent =
                translations.next;
                
            document.getElementById("startTest").textContent =
    translations.startTest;
      // Кнопки экрана результата теста

document.getElementById("testAgain").textContent =
    translations.testAgain;

document.getElementById("backToTraining").textContent =
    translations.backToTraining;  }


        const answer =
            document.getElementById("answer");

        if (answer) {
            answer.placeholder =
                translations.answerPlaceholder;
        }


        const checkAnswer =
            document.getElementById("checkAnswer");

        if (checkAnswer) {
            checkAnswer.textContent =
                translations.check;
        }


        // =====================================
        // Кнопка начала теста
        // =====================================

        const startTest =
            document.getElementById("startTest");

        if (startTest && translations.startTest) {
            startTest.textContent =
                translations.startTest;
        }


        // =====================================
        // Кнопка проверки в тесте
        // =====================================

        const testCheck =
            document.getElementById("testCheck");

        if (testCheck && translations.check) {
            testCheck.textContent =
                translations.check;
        }


        // =====================================
        // Кнопки результата теста
        // =====================================

        const restartTest =
            document.getElementById("restartTest");

        if (restartTest && translations.restartTest) {
            restartTest.textContent =
                translations.restartTest;
        }


        const backToTraining =
            document.getElementById("backToTraining");

        if (
            backToTraining &&
            translations.backToTraining
        ) {
            backToTraining.textContent =
                translations.backToTraining;
        }


        // =====================================
        // Поле ответа в тесте
        // =====================================

        const testAnswer =
            document.getElementById("testAnswer");

        if (testAnswer) {
            testAnswer.placeholder =
                translations.answerPlaceholder;
        }


        // =====================================
        // Статус
        // =====================================

        const status =
            document.getElementById("status");

        if (
            status &&
            translations.statusLoading
        ) {
            status.textContent =
                translations.statusLoading;
        }


        // =====================================
        // Footer
        // =====================================

        const footer =
            document.querySelector("footer");

        if (footer) {
            footer.textContent =
                translations.footer;
        }


        // =====================================
        // Результат теста
        // =====================================

        const testFinished =
            document.getElementById("testFinished");

        if (
            testFinished &&
            translations.testFinished
        ) {
            testFinished.textContent =
                translations.testFinished;
        }


        const testPercent =
            document.getElementById("testPercent");

        if (
            testPercent &&
            testPercent.dataset.percent
        ) {

            testPercent.textContent =
                `${translations.result}: ` +
                `${testPercent.dataset.percent}%`;

        }


        // =====================================
        // Результат обычной тренировки
        // =====================================

        const result =
            document.getElementById("result");

        if (
            result &&
            result.dataset.type === "correct"
        ) {

            result.textContent =
                `✅ ${translations.correct}`;

        }


        if (
            result &&
            result.dataset.type === "incorrect"
        ) {

            result.textContent =
                `❌ ${translations.incorrect} ` +
                `${translations.correctAnswer} ` +
                `${result.dataset.answer}`;

        }


        // =====================================
        // Результат ответа в тесте
        // =====================================

        const testResult =
            document.getElementById("testResult");

        if (
            testResult &&
            testResult.dataset.type === "correct"
        ) {

            testResult.textContent =
                `✅ ${translations.correct}`;

        }


        if (
            testResult &&
            testResult.dataset.type === "incorrect"
        ) {

            testResult.textContent =
                `❌ ${translations.incorrect} ` +
                `${translations.correctAnswer} ` +
                `${testResult.dataset.answer}`;

        }

    }

    catch (error) {

        console.error(
            "Ошибка загрузки языка:",
            error
        );

    }

}