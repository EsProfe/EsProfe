"use strict";
(function(){
  // A1 curriculum dispatches its lesson event on document. The lesson engine
  // historically listened on window, so cards looked active but opened nothing.
  document.addEventListener("esprofe:a1Topic", function(event){
    const topicId = event.detail && event.detail.topicId;
    if (!topicId) return;
    if (window.EsProfeA1Lessons && typeof window.EsProfeA1Lessons.open === "function") {
      window.EsProfeA1Lessons.open(topicId);
    }
  });
})();
