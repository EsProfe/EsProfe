"use strict";

let translations = {};

async function loadLanguage(lang) {

    const response = await fetch(`locales/${lang}.json`);

    translations = await response.json();

    document.getElementById("title").textContent =
        translations.title;

    document.getElementById("subtitle").textContent =
        translations.subtitle;

    document.getElementById("nextVerb").textContent =
        translations.next;

    document.querySelector("footer").textContent =
        translations.footer;

}