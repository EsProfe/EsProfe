"use strict";
(function () {
  const LANGUAGES = ["ru", "uk", "en", "es"];
  const ISO = {"España":"es","Ucrania":"ua","Francia":"fr","Alemania":"de","Italia":"it","Portugal":"pt","Reino Unido":"gb","Estados Unidos":"us","Polonia":"pl","Rumanía":"ro","Marruecos":"ma","Argentina":"ar","México":"mx","Colombia":"co","Venezuela":"ve","Brasil":"br","China":"cn","Japón":"jp","Canadá":"ca","Bélgica":"be","Países Bajos":"nl","Suiza":"ch","Austria":"at","Irlanda":"ie","Suecia":"se","Noruega":"no","Dinamarca":"dk","Finlandia":"fi","Chequia":"cz","Hungría":"hu","Grecia":"gr","Turquía":"tr","Bulgaria":"bg","Moldavia":"md","Georgia":"ge","Israel":"il","India":"in","Corea del Sur":"kr","Australia":"au","Nueva Zelanda":"nz","Cuba":"cu","Chile":"cl","Perú":"pe","Ecuador":"ec","Uruguay":"uy","Paraguay":"py","Bolivia":"bo","República Dominicana":"do","Costa Rica":"cr","Panamá":"pa","Egipto":"eg"};
  const SPANISH_MAIN = new Set(["España","Argentina","México","Colombia","Venezuela","Cuba","Chile","Perú","Ecuador","Uruguay","Paraguay","Bolivia","República Dominicana","Costa Rica","Panamá"]);
  const UI = {
    ru:{core:"Основные страны A1",more:"Показать больше стран",less:"Скрыть дополнительный список",quiz:"Мини-тренировка",qcountry:"Выбери страну для этой национальности",qcapital:"Выбери столицу страны",qsame:"Какая национальность имеет одну форму для мужчины и женщины?",qwoman:"Выбери форму национальности для женщины",next:"Следующий вопрос",correct:"Верно!",wrong:"Попробуй ещё раз",hint:"Страна → столица → национальность",sameShort:"одна форма ♂ = ♀",sameTitle:"Обрати внимание: одна форма для мужчины и женщины",sameText:"Некоторые национальности не меняются по роду. Говорим: un canadiense / una canadiense; un belga / una belga; un estadounidense / una estadounidense. Род показывает артикль или контекст, а сама форма остаётся той же.",esLegend:"испанский — основной или официальный язык"},
    uk:{core:"Основні країни A1",more:"Показати більше країн",less:"Сховати додатковий список",quiz:"Міні-тренування",qcountry:"Обери країну для цієї національності",qcapital:"Обери столицю країни",qsame:"Яка національність має одну форму для чоловіка й жінки?",qwoman:"Обери форму національності для жінки",next:"Наступне питання",correct:"Правильно!",wrong:"Спробуй ще раз",hint:"Країна → столиця → національність",sameShort:"одна форма ♂ = ♀",sameTitle:"Зверни увагу: одна форма для чоловіка й жінки",sameText:"Деякі національності не змінюються за родом. Кажемо: un canadiense / una canadiense; un belga / una belga; un estadounidense / una estadounidense. Рід показує артикль або контекст, а сама форма залишається однаковою.",esLegend:"іспанська — основна або офіційна мова"},
    en:{core:"Core A1 countries",more:"Show more countries",less:"Hide extra countries",quiz:"Mini practice",qcountry:"Choose the country for this nationality",qcapital:"Choose the capital of the country",qsame:"Which nationality has the same form for men and women?",qwoman:"Choose the nationality form for a woman",next:"Next question",correct:"Correct!",wrong:"Try again",hint:"Country → capital → nationality",sameShort:"same form ♂ = ♀",sameTitle:"Notice: one form for men and women",sameText:"Some nationality words do not change for gender: un canadiense / una canadiense; un belga / una belga; un estadounidense / una estadounidense. The article or context shows gender; the nationality form itself stays the same.",esLegend:"Spanish is a main or official language"},
    es:{core:"Países esenciales de A1",more:"Mostrar más países",less:"Ocultar países adicionales",quiz:"Mini práctica",qcountry:"Elige el país de esta nacionalidad",qcapital:"Elige la capital del país",qsame:"¿Qué gentilicio tiene la misma forma para hombre y mujer?",qwoman:"Elige la forma del gentilicio para una mujer",next:"Siguiente pregunta",correct:"¡Correcto!",wrong:"Inténtalo otra vez",hint:"País → capital → nacionalidad",sameShort:"misma forma ♂ = ♀",sameTitle:"Atención: una sola forma para hombre y mujer",sameText:"Algunos gentilicios no cambian de género: un canadiense / una canadiense; un belga / una belga; un estadounidense / una estadounidense. El artículo o el contexto indican el género; la forma del gentilicio se mantiene igual.",esLegend:"el español es lengua principal u oficial"}
  };

  const language = () => document.getElementById("language")?.value || "ru";
  const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char]));

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = .78;
    window.speechSynthesis.speak(utterance);
  }

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  const audio = (text, label) => `<button class="country-audio" type="button" data-country-speak="${esc(text)}" aria-label="${esc(label)}">🔊</button>`;
  const flag = item => {
    const code = ISO[item.country];
    return code ? `<img class="country-flag-img" src="https://flagcdn.com/24x18/${code}.png" srcset="https://flagcdn.com/48x36/${code}.png 2x" width="24" height="18" alt="" loading="lazy" decoding="async">` : "";
  };

  function row(item, copy, ui) {
    const nationality = item.same
      ? `<div class="country-nat same">${audio(item.m, copy.listen)}<b>${esc(item.m)}</b><span class="country-same">★ ${esc(ui.sameShort)}</span></div>`
      : `<div class="country-nat"><span>♂ ${audio(item.m, copy.listen)}<b>${esc(item.m)}</b></span><span>♀ ${audio(item.f, copy.listen)}<b>${esc(item.f)}</b></span></div>`;
    const badge = SPANISH_MAIN.has(item.country) ? `<span class="country-es-badge" title="${esc(ui.esLegend)}">ES</span>` : "";
    return `<article class="country-row"><div class="country-cell country-name">${audio(item.country, copy.listen)}<div><small>${esc(copy.country)}</small><strong><span>${esc(item.country)}</span>${flag(item)}${badge}</strong></div></div><div class="country-arrow">→</div><div class="country-cell country-capital">${audio(item.capital, copy.listen)}<div><small>${esc(copy.capital)}</small><b>${esc(item.capital)}</b></div></div><div class="country-arrow">→</div><div class="country-cell country-nationality"><div><small>${esc(copy.man)} / ${esc(copy.woman)}</small>${nationality}</div></div></article>`;
  }

  function bindAudio(root) {
    root.querySelectorAll("[data-country-speak]").forEach(button => {
      button.onclick = () => speak(button.dataset.countrySpeak);
    });
  }

  function renderQuiz(reference) {
    const box = document.getElementById("countryMiniQuiz");
    if (!box) return;
    const ui = UI[language()] || UI.ru;
    const core = reference.items.filter(item => item.priority === 1);
    const type = Math.floor(Math.random() * 4);
    let answer;
    let prompt;
    let options;

    if (type === 0) {
      const item = core[Math.floor(Math.random() * core.length)];
      answer = item.country;
      prompt = `${ui.qcountry}: <button type="button" class="country-inline-audio" data-country-speak="${esc(item.m)}" aria-label="${esc(item.m)}">🔊</button> <b>${esc(item.m)}</b>`;
      options = shuffle([item, ...shuffle(core.filter(value => value.country !== item.country)).slice(0, 2)]).map(value => value.country);
    } else if (type === 1) {
      const item = core[Math.floor(Math.random() * core.length)];
      answer = item.capital;
      prompt = `${ui.qcapital}: <b class="country-quiz-country">${esc(item.country)} ${flag(item)}</b>`;
      options = shuffle([item, ...shuffle(core.filter(value => value.country !== item.country)).slice(0, 2)]).map(value => value.capital);
    } else if (type === 2) {
      const same = core.filter(item => item.same);
      const item = same[Math.floor(Math.random() * same.length)];
      answer = item.m;
      prompt = ui.qsame;
      options = shuffle([item.m, ...shuffle(core.filter(value => !value.same)).slice(0, 2).map(value => value.m)]);
    } else {
      const change = core.filter(item => !item.same && item.m !== item.f);
      const item = change[Math.floor(Math.random() * change.length)];
      answer = item.f;
      prompt = `${ui.qwoman}: <b>${esc(item.country)}</b>`;
      const wrong = [item.m, ...shuffle(change.filter(value => value.country !== item.country)).map(value => value.f)].filter((value, index, all) => all.indexOf(value) === index).slice(0, 2);
      options = shuffle([answer, ...wrong]);
    }

    box.innerHTML = `<h3>🎯 ${esc(ui.quiz)}</h3><p>${prompt}</p><div class="country-quiz-options">${options.map(option => `<button type="button" data-answer="${esc(option)}">${esc(option)}</button>`).join("")}</div><p class="country-quiz-result"></p><button type="button" class="country-next">${esc(ui.next)}</button>`;
    bindAudio(box);
    box.querySelectorAll("[data-answer]").forEach(button => {
      button.onclick = () => {
        const result = box.querySelector(".country-quiz-result");
        if (button.dataset.answer === answer) {
          result.textContent = `✓ ${ui.correct}`;
          speak(answer);
        } else {
          result.textContent = `✗ ${ui.wrong}`;
        }
      };
    });
    box.querySelector(".country-next").onclick = () => renderQuiz(reference);
  }

  function render(lesson, root) {
    const reference = lesson?.reference;
    const target = root?.querySelector("#a1Examples");
    if (!reference || !target) return;
    const code = LANGUAGES.includes(language()) ? language() : "ru";
    const copy = reference.i18n?.[code] || reference.i18n?.ru;
    const ui = UI[code] || UI.ru;
    const core = reference.items.filter(item => item.priority === 1);
    const extra = reference.items.filter(item => item.priority !== 1);
    target.insertAdjacentHTML("beforebegin", `<section class="a1-country-reference" id="a1CountryReference"><div class="country-ref-head"><div><h2>🌍 ${esc(copy.title)}</h2><p>${esc(copy.intro)}</p><div class="country-legend"><span class="country-es-badge">ES</span><span>${esc(ui.esLegend)}</span></div></div><div class="country-path">${esc(ui.hint)}</div></div><aside class="country-same-note"><strong>★ ${esc(ui.sameTitle)}</strong><p>${esc(ui.sameText)}</p></aside><h3>${esc(ui.core)}</h3><div class="country-ref-table">${core.map(item => row(item, copy, ui)).join("")}</div><button type="button" id="countryMore" class="country-more" aria-expanded="false">＋ ${esc(ui.more)}</button><div id="countryExtra" hidden class="country-ref-table country-extra">${extra.map(item => row(item, copy, ui)).join("")}</div><section id="countryMiniQuiz"></section></section>`);
    const more = document.getElementById("countryMore");
    const extraBox = document.getElementById("countryExtra");
    more.onclick = () => {
      extraBox.hidden = !extraBox.hidden;
      more.setAttribute("aria-expanded", String(!extraBox.hidden));
      more.textContent = `${extraBox.hidden ? "＋ " : "− "}${extraBox.hidden ? ui.more : ui.less}`;
    };
    bindAudio(root);
    renderQuiz(reference);
  }

  window.EsProfeA1CountryReference = { render };
})();
