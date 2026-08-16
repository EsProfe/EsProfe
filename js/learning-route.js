"use strict";
document.addEventListener("esprofe:progressAction",event=>{const step=event.detail;if(!step)return;if(step.topic==="grammar"){document.dispatchEvent(new CustomEvent("esprofe:subtopic",{detail:{topic:"grammar",subtopic:step.subtopic||"presente"}}));}});
