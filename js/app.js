"use strict";

let verbs = [];
let currentVerb = 0;

// =====================================
// Показ текущего глагола
// =====================================

function showVerb() {

    if (verbs.length === 0) return;

    const verb = verbs[currentVerb];

    const selectedLanguage =
        document.getElementById("language").value;

    document.getElementById("verb").textContent =
        verb.infinitive;

    document.getElementById("translation").textContent =
        verb.translations[selectedLanguage];

}


// =====================================
// Запуск приложения
// =====================================

async function initApp() {

    loadLanguage("ru");

    verbs = await loadVerbs();

    document.getElementById("status").textContent =
        `Загружено глаголов: ${verbs.length}`;

    showVerb();

}

initApp();


// =====================================
// Следующий глагол
// =====================================

document.getElementById("nextVerb").addEventListener("click", () => {

    currentVerb++;

    if (currentVerb >= verbs.length) {

        currentVerb = 0;

    }

    showVerb();

});


// =====================================
// Переключение языка
// =====================================

const languageSelector =
    document.getElementById("language");

languageSelector.addEventListener("change", (event) => {

    loadLanguage(event.target.value);

    showVerb();

});