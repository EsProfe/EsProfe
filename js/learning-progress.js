"use strict";
(function(){
function mode(){return document.documentElement.dataset.learningMode||"home"}
function isFree(){return mode()==="free"}
function isCourse(){return mode()==="course"}
function recordPracticeAnswer(isCorrect){if(isFree())window.EsProfeSessionProgress?.record(!!isCorrect)}
function recordGrammarResult(id,percent,details){if(isCourse()&&window.progressRecordGrammar)window.progressRecordGrammar(id,percent,details||[])}
function recordLessonResult(level,id,result){if(isCourse()&&window.progressRecordLesson)window.progressRecordLesson(level,id,result)}
window.EsProfeLearningProgress={mode,isFree,isCourse,recordPracticeAnswer,recordGrammarResult,recordLessonResult};
})();
