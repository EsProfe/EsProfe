"use strict";

// =====================================
// EsProfe — выбор темы обучения
// =====================================

function initTopicMenu() {

    const topicSelector =
        document.getElementById("topicSelector");

    if (!topicSelector) {
        return;
    }

    topicSelector.addEventListener("change", (event) => {

        const topic = event.target.value;
        const topicNotice = document.getElementById("topicNotice");

        if (!topicNotice) {
            return;
        }

        const messages = {
            verbs: "Тема «Спряжение глаголов» выбрана.",
            grammar: "Раздел грамматики готовится. Материалы будут добавляться после проверки.",
            vocabulary: "Раздел словарного запаса готовится.",
            listening: "Раздел аудирования готовится.",
            exams: "Раздел подготовки к DELE / EOI готовится."
        };

        topicNotice.textContent = messages[topic] || "";

    });
}

document.addEventListener("DOMContentLoaded", initTopicMenu);
