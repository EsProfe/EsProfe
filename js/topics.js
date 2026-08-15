"use strict";

// =====================================
// EsProfe — компактная навигация по темам
// =====================================

const topicMap = {
    verbs: {
        title: "Глаголы · выберите раздел",
        items: [
            ["present", "Presente", "Основная тренировка"],
            ["ar", "AR", "Глаголы на -ar"],
            ["er", "ER", "Глаголы на -er"],
            ["ir", "IR", "Глаголы на -ir"],
            ["irregular", "Неправильные", "Особые формы"],
            ["test", "Тест", "Проверка знаний"]
        ]
    },
    grammar: {
        title: "Грамматика · разделы",
        items: [
            ["presente", "Presente", "Правило и примеры"],
            ["articles", "Артикли", "el / la / los / las"],
            ["gender", "Род", "masculino / femenino"],
            ["ser-estar", "Ser / Estar", "Когда использовать"]
        ]
    },
    vocabulary: {
        title: "Слова · разделы",
        items: [
            ["daily", "Повседневные", "Слова на каждый день"],
            ["travel", "Путешествия", "В дороге и в городе"],
            ["work", "Работа", "Учёба и профессия"],
            ["dele", "DELE", "Экзаменационная лексика"]
        ]
    },
    listening: {
        title: "Аудирование · разделы",
        items: [
            ["a1", "A1", "Начальный уровень"],
            ["a2", "A2", "Базовый уровень"],
            ["b1", "B1", "Средний уровень"],
            ["b2", "B2", "Экзаменационный уровень"]
        ]
    },
    exams: {
        title: "DELE / EOI · разделы",
        items: [
            ["dele", "DELE", "Тренировка экзамена"],
            ["eoi", "EOI", "Подготовка к EOI"],
            ["b1", "B1", "Уровень B1"],
            ["b2", "B2", "Уровень B2"],
            ["c1", "C1", "Уровень C1"]
        ]
    }
};

function renderSubtopics(topic) {
    const panel = document.getElementById("subtopicPanel");
    const title = document.getElementById("subtopicTitle");
    const list = document.getElementById("subtopicList");

    if (!panel || !title || !list) return;

    const data = topicMap[topic];
    if (!data) return;

    title.textContent = data.title;
    list.innerHTML = "";

    data.items.forEach(([id, label, hint], index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `subtopic-chip${index === 0 ? " active" : ""}`;
        button.dataset.subtopic = id;
        button.innerHTML = `<strong>${label}</strong><small>${hint}</small>`;

        button.addEventListener("click", () => {
            list.querySelectorAll(".subtopic-chip").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            const notice = document.getElementById("topicNotice");
            if (notice) notice.textContent = `${label}: ${hint}`;
        });

        list.appendChild(button);
    });

    panel.hidden = false;
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

    renderSubtopics("verbs");
}

document.addEventListener("DOMContentLoaded", initTopicMenu);
