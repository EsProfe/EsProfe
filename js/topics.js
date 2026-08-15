"use strict";

// =====================================
// EsProfe — компактная навигация по темам
// Тексты берутся из текущего языка интерфейса.
// =====================================

const topicMap = {
    verbs: {
        titleKey: "verbsTopicTitle",
        items: [["present", "present", "presentHint"], ["ar", "ar", "arHint"], ["er", "er", "erHint"], ["ir", "ir", "irHint"], ["irregular", "irregular", "irregularHint"], ["test", "test", "testHint"]]
    },
    grammar: {
        titleKey: "grammarTopicTitle",
        items: [["presente", "grammarPresente", "grammarPresenteHint"], ["articles", "articles", "articlesHint"], ["gender", "gender", "genderHint"], ["ser-estar", "serEstar", "serEstarHint"]]
    },
    vocabulary: {
        titleKey: "vocabularyTopicTitle",
        items: [["daily", "daily", "dailyHint"], ["travel", "travel", "travelHint"], ["work", "work", "workHint"], ["dele", "vocabularyDele", "vocabularyDeleHint"]]
    },
    listening: {
        titleKey: "listeningTopicTitle",
        items: [["a1", "a1", "a1Hint"], ["a2", "a2", "a2Hint"], ["b1", "b1", "b1Hint"], ["b2", "b2", "b2Hint"]]
    },
    exams: {
        titleKey: "examsTopicTitle",
        items: [["dele", "dele", "deleHint"], ["eoi", "eoi", "eoiHint"], ["b1", "b1", "examB1Hint"], ["b2", "b2", "examB2Hint"], ["c1", "c1", "examC1Hint"]]
    }
};

function topicText(key, fallback = "") {
    return (typeof translations !== "undefined" && translations[key]) || fallback;
}

function renderSubtopics(topic) {
    const panel = document.getElementById("subtopicPanel");
    const title = document.getElementById("subtopicTitle");
    const list = document.getElementById("subtopicList");
    if (!panel || !title || !list) return;

    const data = topicMap[topic];
    if (!data) return;

    title.textContent = topicText(data.titleKey, "");
    list.innerHTML = "";

    data.items.forEach(([id, labelKey, hintKey], index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `subtopic-chip${index === 0 ? " active" : ""}`;
        button.dataset.subtopic = id;

        const strong = document.createElement("strong");
        strong.textContent = topicText(labelKey, labelKey);
        const small = document.createElement("small");
        small.textContent = topicText(hintKey, "");

        button.appendChild(strong);
        button.appendChild(small);

        button.addEventListener("click", () => {
            list.querySelectorAll(".subtopic-chip").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            const notice = document.getElementById("topicNotice");
            if (notice) notice.textContent = `${strong.textContent}: ${small.textContent}`;
        });

        list.appendChild(button);
    });

    panel.hidden = false;
}

function updateTopicTexts() {
    const label = document.getElementById("topicLabel");
    const hint = document.getElementById("topicHint");
    if (label) label.textContent = topicText("topicLabel", "");
    if (hint) hint.textContent = topicText("topicHint", "");

    document.querySelectorAll(".topic-card").forEach((card) => {
        const topic = card.dataset.topic;
        const title = card.querySelector("strong");
        const description = card.querySelector("small");
        if (title) title.textContent = topicText(`${topic}Title`, "");
        if (description) description.textContent = topicText(`${topic}Hint`, "");
    });

    const activeCard = document.querySelector(".topic-card.active");
    renderSubtopics(activeCard ? activeCard.dataset.topic : "verbs");
}

function initTopicMenu() {
    const topicSelector = document.getElementById("topicSelector");
    const topicCards = document.querySelectorAll(".topic-card");
    if (!topicSelector || !topicCards.length) return;

    topicCards.forEach((card) => {
        card.addEventListener("click", () => {
            const topic = card.dataset.topic;
            topicSelector.value = topic;
            topicCards.forEach((item) => item.classList.remove("active"));
            card.classList.add("active");
            renderSubtopics(topic);
        });
    });

    updateTopicTexts();
}

document.addEventListener("DOMContentLoaded", initTopicMenu);
