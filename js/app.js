"use strict";

// =====================================
// EsProfe v0.7.0
// Тренировка + тест + фильтры + повтор ошибок + прогресс
// =====================================

let verbs = [];
let allVerbs = [];
let currentVerb = 0;
let currentPerson = "yo";
let activeVerbFilter = "present";
const persons = ["yo", "tú", "él", "nosotros", "vosotros", "ellos"];
let correctAnswers = 0;
let wrongAnswers = 0;
let mistakeQueue = [];
let mistakesMode = false;
const TEST_LENGTH = 10;
let testQuestion = 0;
let testCorrect = 0;
let testWrong = 0;
let testActive = false;

async function loadVerbs() {
    try {
        const response = await fetch("data/verbs.json");
        if (!response.ok) throw new Error("Не удалось загрузить verbs.json");
        return await response.json();
    } catch (error) {
        console.error(error);
        const status = document.getElementById("status");
        if (status) status.textContent = translations.loadError || "Ошибка загрузки базы глаголов.";
        return [];
    }
}
function getRandomPerson(){return persons[Math.floor(Math.random()*persons.length)];}
function mistakeKey(verb,person){return `${verb.id??verb.infinitive}:${person}`;}
function rememberMistake(verb,person){const key=mistakeKey(verb,person);if(!mistakeQueue.some(item=>item.key===key))mistakeQueue.push({key,verb,person});}
function removeMistake(verb,person){const key=mistakeKey(verb,person);mistakeQueue=mistakeQueue.filter(item=>item.key!==key);}
function updateMistakeButton(){const button=document.getElementById("repeatMistakes");if(!button)return;button.textContent=`${translations.repeatMistakes||"🔁 Повторить ошибки"} (${mistakeQueue.length})`;button.style.display=mistakeQueue.length>0&&!mistakesMode&&!testActive?"inline-block":"none";}
function showVerb(){if(verbs.length===0)return;if(currentVerb>=verbs.length)currentVerb=0;const verb=verbs[currentVerb];const language=document.getElementById("language").value;document.getElementById("verb").textContent=verb.infinitive;document.getElementById("translation").textContent=verb.translations[language]||verb.translations.ru;document.getElementById("person").textContent=currentPerson;document.getElementById("answer").value="";document.getElementById("result").textContent="";document.getElementById("result").dataset.type="";document.getElementById("result").dataset.answer="";document.getElementById("answer").focus();}
function checkAnswer(){if(verbs.length===0)return;const verb=verbs[currentVerb];const input=document.getElementById("answer");const result=document.getElementById("result");const userAnswer=input.value.trim().toLowerCase();const correctAnswer=verb.present[currentPerson].toLowerCase();if(userAnswer===""){result.textContent=translations.emptyAnswer;return;}if(userAnswer===correctAnswer){correctAnswers++;removeMistake(verb,currentPerson);result.dataset.type="correct";result.dataset.answer="";result.textContent=`✅ ${translations.correct}`;if(window.progressRecordAnswer)window.progressRecordAnswer(verb,currentPerson,true);}else{wrongAnswers++;rememberMistake(verb,currentPerson);result.dataset.type="incorrect";result.dataset.answer=verb.present[currentPerson];result.textContent=`❌ ${translations.incorrect} ${translations.correctAnswer} ${verb.present[currentPerson]}`;if(window.progressRecordAnswer)window.progressRecordAnswer(verb,currentPerson,false);}updateStatus();updateMistakeButton();}
function updateStatus(){const status=document.getElementById("status");if(!status)return;status.textContent=`${translations.verbs} ${verbs.length} | ${translations.correctAnswers} ${correctAnswers} | ${translations.wrongAnswers} ${wrongAnswers}`;updateMistakeButton();if(window.renderProgress)window.renderProgress();}
function nextVerb(){if(verbs.length===0)return;currentVerb++;if(currentVerb>=verbs.length)currentVerb=0;currentPerson=getRandomPerson();showVerb();}
function startMistakeReview(){if(mistakeQueue.length===0||testActive)return;mistakesMode=true;verbs=mistakeQueue.map(item=>item.verb);currentVerb=0;currentPerson=mistakeQueue[0].person;document.getElementById("trainingMode").style.display="block";document.getElementById("nextVerb").style.display="inline-block";document.getElementById("startTest").style.display="none";showMistakeQuestion();updateMistakeButton();}
function showMistakeQuestion(){if(!mistakesMode||mistakeQueue.length===0){finishMistakeReview();return;}const item=mistakeQueue[0];currentPerson=item.person;const index=verbs.findIndex(verb=>mistakeKey(verb,currentPerson)===item.key);currentVerb=index>=0?index:0;showVerb();const result=document.getElementById("result");if(result)result.textContent=`${translations.repeatMistakesHint||"Повторяем ошибку"}`;}
function finishMistakeReview(){mistakesMode=false;verbs=[...allVerbs];activeVerbFilter="present";currentVerb=0;currentPerson=getRandomPerson();document.getElementById("startTest").style.display="inline-block";showVerb();updateStatus();updateMistakeButton();}
function handleMistakeNext(){if(!mistakesMode){nextVerb();return;}if(mistakeQueue.length===0){finishMistakeReview();return;}const first=mistakeQueue.shift();mistakeQueue.push(first);showMistakeQuestion();updateMistakeButton();}
function startTest(){if(verbs.length===0)return;mistakesMode=false;testQuestion=0;testCorrect=0;testWrong=0;testActive=true;document.getElementById("trainingMode").style.display="none";document.getElementById("nextVerb").style.display="none";document.getElementById("startTest").style.display="none";document.getElementById("repeatMistakes").style.display="none";document.getElementById("testMode").style.display="block";document.getElementById("testResultScreen").style.display="none";nextTestQuestion();}
function nextTestQuestion(){if(!testActive)return;if(testQuestion>=TEST_LENGTH){finishTest();return;}currentVerb=Math.floor(Math.random()*verbs.length);currentPerson=getRandomPerson();const verb=verbs[currentVerb];const language=document.getElementById("language").value;document.getElementById("verb").textContent=verb.infinitive;document.getElementById("translation").textContent=verb.translations[language]||verb.translations.ru;document.getElementById("testPerson").textContent=currentPerson;document.getElementById("testProgress").textContent=`${translations.question} ${testQuestion+1} ${translations.of} ${TEST_LENGTH}`;document.getElementById("testAnswer").value="";document.getElementById("testCheck").textContent=translations.check;document.getElementById("testResult").textContent="";document.getElementById("testResult").dataset.type="";document.getElementById("testResult").dataset.answer="";document.getElementById("testAnswer").focus();}
function checkTestAnswer(){if(!testActive)return;const input=document.getElementById("testAnswer");const result=document.getElementById("testResult");const userAnswer=input.value.trim().toLowerCase();if(userAnswer===""){result.textContent=translations.emptyAnswer;return;}const verb=verbs[currentVerb];const correctAnswer=verb.present[currentPerson].toLowerCase();if(userAnswer===correctAnswer){testCorrect++;result.dataset.type="correct";result.dataset.answer="";result.textContent=`✅ ${translations.correct}`;if(window.progressRecordAnswer)window.progressRecordAnswer(verb,currentPerson,true);}else{testWrong++;rememberMistake(verb,currentPerson);result.dataset.type="incorrect";result.dataset.answer=verb.present[currentPerson];result.textContent=`❌ ${translations.incorrect} ${translations.correctAnswer} ${verb.present[currentPerson]}`;if(window.progressRecordAnswer)window.progressRecordAnswer(verb,currentPerson,false);}testQuestion++;setTimeout(nextTestQuestion,800);}
function finishTest(){testActive=false;document.getElementById("testMode").style.display="none";document.getElementById("testResultScreen").style.display="block";document.getElementById("restartTest").textContent=translations.testAgain;document.getElementById("backToTraining").textContent=translations.backToTraining;const percent=Math.round((testCorrect/TEST_LENGTH)*100);if(window.progressRecordTest)window.progressRecordTest(percent);document.getElementById("testFinished").textContent=translations.testFinished;document.getElementById("testScore").textContent=`${testCorrect} / ${TEST_LENGTH}`;const testPercent=document.getElementById("testPercent");testPercent.dataset.percent=percent;testPercent.textContent=`${translations.result} ${percent}%`;}
function restartTest(){startTest();}
function backToTraining(){testActive=false;mistakesMode=false;document.getElementById("testMode").style.display="none";document.getElementById("testResultScreen").style.display="none";document.getElementById("trainingMode").style.display="block";document.getElementById("nextVerb").style.display="inline-block";document.getElementById("startTest").style.display="inline-block";verbs=[...allVerbs];currentVerb=0;currentPerson=getRandomPerson();showVerb();updateMistakeButton();}
function applyVerbFilter(filter){activeVerbFilter=filter;mistakesMode=false;if(filter==="ar"||filter==="er"||filter==="ir")verbs=allVerbs.filter(verb=>verb.group===filter.toUpperCase());else if(filter==="irregular")verbs=allVerbs.filter(verb=>verb.irregular===true);else verbs=[...allVerbs];currentVerb=0;currentPerson=getRandomPerson();document.getElementById("startTest").style.display="inline-block";updateStatus();showVerb();}
function handleVerbSubtopic(event){const subtopic=event.detail&&event.detail.subtopic;if(!subtopic)return;if(subtopic==="test"){startTest();return;}if(!testActive)applyVerbFilter(subtopic);}
async function changeLanguage(language){if(typeof loadLanguage==="function")await loadLanguage(language);updateStatus();if(testActive){const progress=document.getElementById("testProgress");if(progress)progress.textContent=`${translations.question} ${testQuestion+1} ${translations.of} ${TEST_LENGTH}`;}if(!testActive)showVerb();document.dispatchEvent(new CustomEvent("esprofe:languageChanged"));}

document.getElementById("checkAnswer").addEventListener("click",checkAnswer);document.getElementById("nextVerb").addEventListener("click",handleMistakeNext);document.getElementById("startTest").addEventListener("click",startTest);document.getElementById("testCheck").addEventListener("click",checkTestAnswer);document.getElementById("restartTest").addEventListener("click",restartTest);document.getElementById("backToTraining").addEventListener("click",backToTraining);document.getElementById("repeatMistakes").addEventListener("click",startMistakeReview);document.getElementById("language").addEventListener("change",event=>changeLanguage(event.target.value));document.addEventListener("esprofe:subtopic",handleVerbSubtopic);

async function initApp(){const languageSelector=document.getElementById("language");const selectedLanguage=languageSelector.value||"ru";if(typeof loadLanguage==="function")await loadLanguage(selectedLanguage);allVerbs=await loadVerbs();verbs=[...allVerbs];updateStatus();currentPerson=getRandomPerson();showVerb();if(window.renderProgress)window.renderProgress();}
document.getElementById("answer").addEventListener("keydown",event=>{if(event.key==="Enter")checkAnswer();});document.getElementById("testAnswer").addEventListener("keydown",event=>{if(event.key==="Enter")checkTestAnswer();});initApp();
