"use strict";

// =====================================
// EsProfe — компактный выбор темы
// =====================================

function initTopicMenu() {
    const topicSelector = document.getElementById("topicSelector");
    const topicCards = document.querySelectorAll(".topic-card");
    const topicNotice = document.getElementById("topicNotice");

    if (!topicSelector || !topicCards.length) return;

    const messages = {
        verbs: "Спряжение глаголов",
        grammar: "Грамматика — материалы добавляются после проверки",
        vocabulary: "Словарный запас — раздел готовится",
        listening: "Аудирование — раздел готовится",
        exams: "DELE / EOI — раздел подготовки готовится"
    };

    topicCards.forEach((card) => {
        card.addEventListener("click", () => {
            const topic = card.dataset.topic;
            topicSelector.value = topic;

            topicCards.forEach((item) => item.classList.remove("active"));
            card.classList.add("active");

            if (topicNotice) {
                topicNotice.textContent = messages[topic] || "";
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", initTopicMenu);
