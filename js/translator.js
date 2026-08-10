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


        // Заголовок

        document.getElementById("title").textContent =
            translations.title;


        // Подзаголовок

        document.getElementById("subtitle").textContent =
            translations.subtitle;


        // Кнопка следующего глагола

        document.getElementById("nextVerb").textContent =
            translations.next;


        // Поле ответа

        document.getElementById("answer").placeholder =
            translations.answerPlaceholder;


        // Кнопка проверки

        document.getElementById("checkAnswer").textContent =
            translations.check;


        // Статус загрузки

        if (document.getElementById("status")) {

            document.getElementById("status").textContent =
                translations.statusLoading;

        }


        // Footer

        document.querySelector("footer").textContent =
            translations.footer;

    }

    catch (error) {

        console.error(error);

    }

}