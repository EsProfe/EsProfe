"use strict";
(function(){
  document.addEventListener("esprofe:subtopic", function(e){
    const d=e.detail||{};
    if(!["vocabulary","listening","exams"].includes(d.topic)) return;
    const box=document.getElementById("sectionWorkspace");
    if(box){box.dataset.topic=d.topic;box.dataset.subtopic=d.subtopic;}
  });
})();
