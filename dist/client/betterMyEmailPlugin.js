(()=>{"use strict";var e={d:(t,o)=>{for(var n in o)e.o(o,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:o[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};e.d({},{Y:()=>m});class t{static getFeedbackData(){return{totalUses:localStorage.getItem(t.totalUsesKey),lastFeedbackTime:localStorage.getItem(t.lastFeedbackTimeKey),lastFeedbackGiven:localStorage.getItem(t.lastFeedbackGivenKey),usesSinceLastFeedback:localStorage.getItem(t.usesSinceLastFeedbackKey)}}static resetFeedbackData(){localStorage.removeItem(t.totalUsesKey),localStorage.removeItem(t.lastFeedbackTimeKey),localStorage.removeItem(t.lastFeedbackGivenKey),localStorage.removeItem(t.usesSinceLastFeedbackKey)}static incrementUsage(){let e=parseInt(localStorage.getItem(t.totalUsesKey)||"0");e++,localStorage.setItem(t.totalUsesKey,e.toString());let o=parseInt(localStorage.getItem(t.usesSinceLastFeedbackKey)||"0");o++,localStorage.setItem(t.usesSinceLastFeedbackKey,o.toString()),console.log("Incremented usage"),console.log("Total Uses: "+e),console.log("Uses Since Last Feedback: "+o)}static shouldShowFeedbackPopup(){const e=localStorage.getItem(t.lastFeedbackGivenKey||"false"),o=parseInt(localStorage.getItem(t.usesSinceLastFeedbackKey)||"0");if(null===localStorage.getItem(t.lastFeedbackGivenKey)&&localStorage.setItem(t.lastFeedbackGivenKey,"false"),"true"===e){let e=o>=5;return e&&localStorage.setItem(t.usesSinceLastFeedbackKey,"0"),e}if("false"===e){let e=o>=3;return e&&localStorage.setItem(t.usesSinceLastFeedbackKey,"0"),e}return!1}}t.totalUsesKey="totalUses",t.lastFeedbackTimeKey="lastFeedbackTime",t.lastFeedbackGivenKey="lastFeedbackGiven",t.usesSinceLastFeedbackKey="usesSinceLastFeedback";var o=function(e,t,o,n){return new(o||(o=Promise))((function(a,r){function l(e){try{s(n.next(e))}catch(e){r(e)}}function i(e){try{s(n.throw(e))}catch(e){r(e)}}function s(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(l,i)}s((n=n.apply(e,t||[])).next())}))};const n={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let a;const r=new Uint8Array(16);function l(){if(!a){if("undefined"==typeof crypto||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");a=crypto.getRandomValues.bind(crypto)}return a(r)}const i=[];for(let e=0;e<256;++e)i.push((e+256).toString(16).slice(1));const s=function(e,t,o){if(n.randomUUID&&!t&&!e)return n.randomUUID();const a=(e=e||{}).random||(e.rng||l)();if(a[6]=15&a[6]|64,a[8]=63&a[8]|128,t){o=o||0;for(let e=0;e<16;++e)t[o+e]=a[e];return t}return function(e,t=0){return(i[e[t+0]]+i[e[t+1]]+i[e[t+2]]+i[e[t+3]]+"-"+i[e[t+4]]+i[e[t+5]]+"-"+i[e[t+6]]+i[e[t+7]]+"-"+i[e[t+8]]+i[e[t+9]]+"-"+i[e[t+10]]+i[e[t+11]]+i[e[t+12]]+i[e[t+13]]+i[e[t+14]]+i[e[t+15]]).toLowerCase()}(a)};var c=function(e,t,o,n){return new(o||(o=Promise))((function(a,r){function l(e){try{s(n.next(e))}catch(e){r(e)}}function i(e){try{s(n.throw(e))}catch(e){r(e)}}function s(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(l,i)}s((n=n.apply(e,t||[])).next())}))};console.log("betterMyEmailPlugin.js - Start");const d=new class{constructor(){this.selectedRating=null}injectFeedbackForm(){return o(this,void 0,void 0,(function*(){try{const e=yield fetch(chrome.runtime.getURL("dist/client/user_feedback/feedbackForm.html")),t=yield e.text(),o=document.createElement("div");o.innerHTML=t.trim();const n=o.querySelector("style");n?document.head.appendChild(n):console.error("Feedback form styles not found in the loaded HTML.");const a=o.querySelector("#feedbackFormContainer");a?(document.body.appendChild(a),this.initializeFeedbackFormEvents()):console.error("Feedback form container not found in the loaded HTML.")}catch(e){console.error("Error loading feedback form HTML:",e)}}))}initializeFeedbackFormEvents(){const e=document.getElementById("feedbackCloseBtn"),t=document.getElementById("feedbackSubmitBtn"),o=document.getElementById("feedbackEmojiContainer"),n=document.getElementById("feedbackText");e&&(e.onclick=()=>{this.hideFeedbackForm()}),t&&(t.onclick=()=>{const e=n.value.trim();this.selectedRating||e?(this.submitFeedback(this.selectedRating,e),this.hideFeedbackForm()):alert("Please provide a rating or some text feedback.")}),o&&o.addEventListener("click",(e=>{const t=e.target;t.dataset.value&&(this.selectedRating=parseInt(t.dataset.value,10),Array.from(o.children).forEach((e=>{e.style.filter="none"})),t.style.filter="drop-shadow(0 0 5px #1a73e8)")}))}showFeedbackForm(){console.log("Feedback UI : Will display feedback form");const e=document.getElementById("feedbackFormContainer");e&&(console.log("Feedback UI : Feedback Form Found"),e.style.display="block")}hideFeedbackForm(){const e=document.getElementById("feedbackFormContainer");e&&(e.style.display="none"),this.selectedRating=null;const t=document.getElementById("feedbackText");t&&(t.value="")}submitFeedback(e,t){return o(this,void 0,void 0,(function*(){const o=localStorage.getItem("userUUID");if(!o)return console.log("User UUID not found in localStorage. Will NOT submit feedback."),void console.error("User UUID not found in localStorage. Will NOT submit feedback.");e||(e=-1),t||(t="Not Given by User. Only Rating provided"),console.log("Submitting Feedback:",{rating:e,feedbackText:t});const n={uuid:o,rating:e,feedback:t};console.log("Feedback Payload is :",n);try{const e=(yield m()).app_URL+"/submitFeedback";if(console.log("Submitting feedback to:",e),!e)return void console.error("Feedback URL not found in configs. Will NOT submit feedback.");(yield fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok&&(console.log("Feedback submitted successfully."),localStorage.setItem("lastFeedbackGiven","true"))}catch(e){console.error("Error submitting feedback:",e)}}))}};function m(){return new Promise(((e,t)=>{chrome.storage.sync.get(["config"],(function(o){o.config?(console.log("betterMyEmailPlugin.ts: getConfigs() Configs found: ",o.config),e(o.config)):(console.log("betterMyEmailPlugin.ts: getConfigs() Configs NOT found"),t(new Error("Configs not found")))}))}))}function u(e){return c(this,void 0,void 0,(function*(){t.incrementUsage(),console.log("betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI"),document.getElementById("betterMyEmailSpinner").style.display="block";const e=document.querySelector('[role="textbox"][aria-label*="Message Body"]'),o=e?e.textContent:"";console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ",o);try{const e=yield m();console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ",e),e&&e.analysis_URL?(console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ",e.analysis_URL),yield fetch(`${e.analysis_URL}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({emailContent:o})}).then((e=>(console.log("betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: "),console.log("betterMyEmailPlugin.ts: Better my Email Analysis Response: ",e),e.json()))).then((e=>{if(!e)return void console.error("betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis");if(!e.analysisResult)return void console.error("betterMyEmailPlugin.ts Error: Data does not have a analysisResult property");let o;try{const t=e.analysisResult.replace(/```json|```/g,"").trim();o=JSON.parse(t)}catch(t){return console.error("betterMyEmailPlugin.ts Error: Parsing analysisResult JSON: ",t),void console.error("Received BetterMyEmail analysisResult JSON: ",e.analysisResult)}const n=o.recommended_email,a=o.rationale;console.log("betterMyEmailPlugin.ts: Recommended Email: ",n),console.log("betterMyEmailPlugin.ts: Rationale: ",a),document.getElementById("betterMyEmailSpinner").style.display="none",function(e){fetch(chrome.runtime.getURL("dist/client/email_analysis/emailAnalysisResultUI.html")).then((e=>e.text())).then((o=>{const n=document.createElement("div");n.innerHTML=o,document.body.appendChild(n);const a=document.getElementById("betterMyEmailDialog"),r=document.getElementById("recommendedEmailContent"),l=document.getElementById("rationaleContent"),i=document.getElementById("acceptButton"),s=document.getElementById("discardButton");if(!(a&&r&&l&&i&&s))return void console.error("Error: Elements not found in the external HTML");const c=e.recommendedEmail.replace(/\n/g,"<br>");r.innerHTML=c;let m="";if("string"==typeof e.rationale)m=e.rationale.replace(/\n/g,"<br>");else if("object"==typeof e.rationale)for(const[t,o]of Object.entries(e.rationale))m+="string"==typeof o?`<strong>${t}:</strong> ${o.replace(/\n/g,"<br>")}<br>`:`<strong>${t}:</strong> ${o}<br>`;else m="No rationale provided.";l.innerHTML=m,a.showModal(),i.onclick=()=>{t.shouldShowFeedbackPopup()&&(console.log("Accept Button Clicked: Showing Feedback Form"),d.showFeedbackForm()),function(e){const t=document.querySelector('[role="textbox"][aria-label*="Message Body"]');t?t.innerHTML=e.replace(/\n/g,"<br>"):console.error("betterMyEmailPlugin.ts: Email Content Element not found")}(e.recommendedEmail),a.close()},s.onclick=()=>{t.shouldShowFeedbackPopup()&&(console.log("Discard Button Clicked: Showing Feedback Form"),d.showFeedbackForm()),a.close()},a.addEventListener("close",(()=>{console.log("Dialog closed")}))})).catch((e=>console.error("Failed to load the analysis result UI:",e)))}({recommendedEmail:n,rationale:a})})).catch((e=>{console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}))):console.error("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found")}catch(e){console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}}))}function g(){const e=document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');if(e&&e.parentNode){if(!e.nextSibling||"Better My Email"!==e.nextSibling.textContent){const t=function(){const e=document.createElement("button");return e.textContent="Better My Email",e.style.cssText="background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;",e.onclick=u,e}();e.parentNode.insertBefore(t,e.nextSibling)}console.log("betterMyEmailPlugin.js: Send Button Found")}else setTimeout(g,1e3)}d.injectFeedbackForm().then((()=>{console.log("Feedback Form injected successfully")})),function(){console.log("Script executing immediately after load"),function(){let e=localStorage.getItem("userUUID");e&&null!==e&&"null"!==e&&"undefined"!==e&&""!==e?console.log("Existing User with UUID: ",e):(e=s(),null!==e&&localStorage.setItem("userUUID",e.toString()))}();new MutationObserver((e=>{e.forEach((e=>{e.addedNodes.length>0&&g()}))})).observe(document.body,{childList:!0,subtree:!0}),g(),document.body.insertAdjacentHTML("beforeend",'\n        <div id="betterMyEmailSpinner" style="display:none; position: fixed; z-index: 999; top: 50%; left: 50%; transform: translate(-50%, -50%);">\n            <div style="border: 8px solid #f3f3f3; border-radius: 50%; border-top: 8px solid #3498db; width: 60px; height: 60px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;"></div>\n        </div>\n\n        <style>\n            @-webkit-keyframes spin {\n            0% { -webkit-transform: rotate(0deg); }\n            100% { -webkit-transform: rotate(360deg); }\n            }\n\n            @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n            }\n        </style>\n    ')}()})();