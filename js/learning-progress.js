"use strict";
(function(){
const legacy={
  grammar:window.progressRecordGrammar,
  lesson:window.progressRecordLesson,
  test:window.progressRecordTest
};
function mode(){return document.documentElement.dataset.learningMode||"home"}
function isFree(){return mode()==="free"}
function isCourse(){return mode()==="course"}
function recordPracticeAnswer(isCorrect){if(isFree())window.EsProfeSessionProgress?.record(!!isCorrect)}
function recordPracticeBatch(correct,total){if(!isFree())return;const good=Math.max(0,Number(correct)||0),all=Math.max(good,Number(total)||0);for(let i=0;i<good;i++)window.EsProfeSessionProgress?.record(true);for(let i=good;i<all;i++)window.EsProfeSessionProgress?.record(false)}
function recordGrammarResult(id,percent,details){if(isCourse()&&legacy.grammar)legacy.grammar(id,percent,details||[])}
function recordLessonResult(level,id,result){if(isCourse()&&legacy.lesson)legacy.lesson(level,id,result)}
function recordTestResult(percent){if(isCourse()&&legacy.test)legacy.test(percent)}
// Compatibility bridge: old trainers can keep calling the legacy globals without leaking free-session data into permanent student progress.
window.progressRecordGrammar=recordGrammarResult;
window.progressRecordLesson=recordLessonResult;
window.progressRecordTest=recordTestResult;
window.EsProfeLearningProgress={mode,isFree,isCourse,recordPracticeAnswer,recordPracticeBatch,recordGrammarResult,recordLessonResult,recordTestResult};
})();
