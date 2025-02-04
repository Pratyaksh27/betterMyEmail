(()=>{"use strict";var e={d:(t,o)=>{for(var n in o)e.o(o,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:o[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};e.d({},{H:()=>f,Y:()=>y});const t={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let o;const n=new Uint8Array(16);function a(){if(!o){if("undefined"==typeof crypto||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");o=crypto.getRandomValues.bind(crypto)}return o(n)}const l=[];for(let e=0;e<256;++e)l.push((e+256).toString(16).slice(1));const s=function(e,o,n){if(t.randomUUID&&!o&&!e)return t.randomUUID();const s=(e=e||{}).random||(e.rng||a)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,o){n=n||0;for(let e=0;e<16;++e)o[n+e]=s[e];return o}return function(e,t=0){return(l[e[t+0]]+l[e[t+1]]+l[e[t+2]]+l[e[t+3]]+"-"+l[e[t+4]]+l[e[t+5]]+"-"+l[e[t+6]]+l[e[t+7]]+"-"+l[e[t+8]]+l[e[t+9]]+"-"+l[e[t+10]]+l[e[t+11]]+l[e[t+12]]+l[e[t+13]]+l[e[t+14]]+l[e[t+15]]).toLowerCase()}(s)};class r{static getFeedbackData(){return{totalUses:localStorage.getItem(r.totalUsesKey),lastFeedbackTime:localStorage.getItem(r.lastFeedbackTimeKey),lastFeedbackGiven:localStorage.getItem(r.lastFeedbackGivenKey),usesSinceLastFeedback:localStorage.getItem(r.usesSinceLastFeedbackKey),recommendationsAccepted:localStorage.getItem(r.recommendationsAcceptedKey),recommendationsDiscarded:localStorage.getItem(r.recommendationsDiscardedKey)}}static resetFeedbackData(){localStorage.removeItem(r.totalUsesKey),localStorage.removeItem(r.lastFeedbackTimeKey),localStorage.removeItem(r.lastFeedbackGivenKey),localStorage.removeItem(r.usesSinceLastFeedbackKey),localStorage.removeItem(r.recommendationsAcceptedKey),localStorage.removeItem(r.recommendationsDiscardedKey)}static incrementUsage(e){let t=parseInt(localStorage.getItem(r.totalUsesKey)||"0");t++,localStorage.setItem(r.totalUsesKey,t.toString());let o=parseInt(localStorage.getItem(r.usesSinceLastFeedbackKey)||"0");if(o++,localStorage.setItem(r.usesSinceLastFeedbackKey,o.toString()),e){let e=parseInt(localStorage.getItem(r.recommendationsAcceptedKey)||"0");e++,localStorage.setItem(r.recommendationsAcceptedKey,e.toString())}else{let e=parseInt(localStorage.getItem(r.recommendationsDiscardedKey)||"0");e++,localStorage.setItem(r.recommendationsDiscardedKey,e.toString())}console.log("Incremented usage"),console.log("Total Uses: "+t),console.log("Uses Since Last Feedback: "+o)}static shouldShowFeedbackPopup(){const e=localStorage.getItem(r.lastFeedbackGivenKey||"false"),t=parseInt(localStorage.getItem(r.usesSinceLastFeedbackKey)||"0");if(null===localStorage.getItem(r.lastFeedbackGivenKey)&&localStorage.setItem(r.lastFeedbackGivenKey,"false"),"true"===e){let e=t>=5;return e&&localStorage.setItem(r.usesSinceLastFeedbackKey,"0"),e}if("false"===e){let e=t>=3;return e&&localStorage.setItem(r.usesSinceLastFeedbackKey,"0"),e}return!1}}r.totalUsesKey="totalUses",r.lastFeedbackTimeKey="lastFeedbackTime",r.lastFeedbackGivenKey="lastFeedbackGiven",r.usesSinceLastFeedbackKey="usesSinceLastFeedback",r.recommendationsAcceptedKey="recommendationsAccepted",r.recommendationsDiscardedKey="recommendationsDiscarded";var i=function(e,t,o,n){return new(o||(o=Promise))((function(a,l){function s(e){try{i(n.next(e))}catch(e){l(e)}}function r(e){try{i(n.throw(e))}catch(e){l(e)}}function i(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,r)}i((n=n.apply(e,t||[])).next())}))},c=function(e,t,o,n){return new(o||(o=Promise))((function(a,l){function s(e){try{i(n.next(e))}catch(e){l(e)}}function r(e){try{i(n.throw(e))}catch(e){l(e)}}function i(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,r)}i((n=n.apply(e,t||[])).next())}))};let d=!1;const m=new class{constructor(){this.selectedRating=null}injectFeedbackForm(){return i(this,void 0,void 0,(function*(){try{const e=yield fetch(chrome.runtime.getURL("dist/client/user_feedback/feedbackForm.html")),t=yield e.text(),o=document.createElement("div");o.innerHTML=t.trim();const n=o.querySelector("style");n?document.head.appendChild(n):console.error("Feedback form styles not found in the loaded HTML.");const a=o.querySelector("#feedbackFormContainer");a?(document.body.appendChild(a),this.initializeFeedbackFormEvents()):console.error("Feedback form container not found in the loaded HTML.")}catch(e){console.error("Error loading feedback form HTML:",e)}}))}initializeFeedbackFormEvents(){const e=document.getElementById("feedbackCloseBtn"),t=document.getElementById("feedbackSubmitBtn"),o=document.getElementById("feedbackEmojiContainer"),n=document.getElementById("feedbackText");e&&(e.onclick=()=>{this.hideFeedbackForm()}),t&&(t.onclick=()=>{const e=n.value.trim();this.selectedRating||e?(this.submitFeedback(this.selectedRating,e),this.hideFeedbackForm()):alert("Please provide a rating or some text feedback.")}),o&&o.addEventListener("click",(e=>{const t=e.target;t.dataset.value&&(this.selectedRating=parseInt(t.dataset.value,10),Array.from(o.children).forEach((e=>{e.style.filter="none"})),t.style.filter="drop-shadow(0 0 5px #1a73e8)")}))}showFeedbackForm(){console.log("Feedback UI : Will display feedback form");const e=document.getElementById("feedbackFormContainer");e&&(console.log("Feedback UI : Feedback Form Found"),e.style.display="block")}hideFeedbackForm(){const e=document.getElementById("feedbackFormContainer");e&&(e.style.display="none"),this.selectedRating=null;const t=document.getElementById("feedbackText");t&&(t.value="")}submitFeedback(e,t){return i(this,void 0,void 0,(function*(){const o=localStorage.getItem("userUUID");if(!o)return console.log("User UUID not found in localStorage. Will NOT submit feedback."),void console.error("User UUID not found in localStorage. Will NOT submit feedback.");e||(e=-1),t||(t="Not Given by User. Only Rating provided"),console.log("Submitting Feedback:",{rating:e,feedbackText:t});const n={uuid:o,rating:e,feedback:t};console.log("Feedback Payload is :",n);try{const e=(yield y()).app_URL+"/submitFeedback";if(console.log("Submitting feedback to:",e),!e)return void console.error("Feedback URL not found in configs. Will NOT submit feedback.");(yield fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok&&(console.log("Feedback submitted successfully."),localStorage.setItem("lastFeedbackGiven","true"))}catch(e){console.error("Error submitting feedback:",e)}}))}};function u(){return c(this,void 0,void 0,(function*(){console.log("emailAnalysisResultDialog.ts: Inside updateUsageCount");let e=localStorage.getItem(r.totalUsesKey),t=localStorage.getItem(r.usesSinceLastFeedbackKey),o=localStorage.getItem("userUUID"),n=localStorage.getItem(r.recommendationsAcceptedKey),a=localStorage.getItem(r.recommendationsDiscardedKey);console.log("emailAnalysisResultDialog.ts: Usage Stats: ",{uuid:o,total_uses:e,uses_since_last_feedback:t,recommendations_accepted:n,recommendations_discarded:a});const l={uuid:o,total_uses:e,uses_since_last_feedback:t,recommendations_accepted:n,recommendations_discarded:a};try{const e=(yield y()).app_URL+"/submitUsageStats";console.log("emailAnalysisResultDialog.ts: Updating Usage Stats to:",e),(yield fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)})).ok&&console.log("Usage Stats submitted successfully.")}catch(e){console.error("Error submitting usage stats:",e)}}))}m.injectFeedbackForm().then((()=>{console.log("Email Analysis Result Dialog: Feedback Form injected successfully")}));var g=function(e,t,o,n){return new(o||(o=Promise))((function(a,l){function s(e){try{i(n.next(e))}catch(e){l(e)}}function r(e){try{i(n.throw(e))}catch(e){l(e)}}function i(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,r)}i((n=n.apply(e,t||[])).next())}))};function y(){return new Promise(((e,t)=>{chrome.storage.sync.get(["config"],(function(o){o.config?(console.log("betterMyEmailPlugin.ts: getConfigs() Configs found: ",o.config),e(o.config)):(console.log("betterMyEmailPlugin.ts: getConfigs() Configs NOT found"),t(new Error("Configs not found")))}))}))}function f(e){return g(this,void 0,void 0,(function*(){console.log("betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI"),document.getElementById("betterMyEmailSpinner").style.display="block";const e=document.querySelector('[role="textbox"][aria-label*="Message Body"]');if(!e)return void console.error("betterMyEmailPlugin.ts: Email content not found");let t=function(e){const t=[/On .* wrote:/,/Forwarded message:/,/-----Original Message-----/];let o=e;for(const e of t){const t=o.match(e);if(t){o=o.slice(0,t.index).trim();break}}return o}((null==e?void 0:e.innerHTML)||""),{body:o,signature:n}=function(e){const t=[/<div class="gmail_signature">[\s\S]*<\/div>/s,/<table[\s\S]*?<\/table>/s,/<tr[\s\S]*<\/tr>/s,/<td[^>]*border-top:[^>]*>[\s\S]*?<\/td>/s];let o="",n=e;for(const e of t){const t=n.match(e);if(t){o=t[0],n=n.replace(o,"").trim();break}}return{body:n,signature:o}}(t);o=p(o);let a=function(e){const t=document.createElement("div");return t.innerHTML=e,t.textContent||""}(o);console.log("Email Body:",a),console.log("Email Body HTML:",o),console.log("Email Signature:",n);const l=localStorage.getItem("selectedTone")||"professional";console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Selected Tone: ",l);try{const e=yield y();console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ",e),e&&e.analysis_URL?(console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ",e.analysis_URL),yield fetch(`${e.analysis_URL}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({emailContent:o,selectedTone:l})}).then((e=>(console.log("betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: "),console.log("betterMyEmailPlugin.ts: Better my Email Analysis Response: ",e),e.json()))).then((e=>{if(!e)return void console.error("betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis");if(!e.analysisResult)return void console.error("betterMyEmailPlugin.ts Error: Data does not have a analysisResult property");let t;try{const o=e.analysisResult.replace(/```json|```/g,"").trim();t=JSON.parse(o)}catch(t){return console.error("betterMyEmailPlugin.ts Error: Parsing analysisResult JSON: ",t),void console.error("Received BetterMyEmail analysisResult JSON: ",e.analysisResult)}let o=t.recommended_email;o=p(o);const a=`${o}${n}`,l=t.rationale;console.log("betterMyEmailPlugin.ts: Recommended Email: ",a),console.log("betterMyEmailPlugin.ts: Rationale: ",l),document.getElementById("betterMyEmailSpinner").style.display="none",function(e){fetch(chrome.runtime.getURL("dist/client/email_analysis/emailAnalysisResultUI.html")).then((e=>e.text())).then((t=>{const o=document.createElement("div");o.innerHTML=t,document.body.appendChild(o);const n=document.getElementById("betterMyEmailDialog"),a=document.getElementById("recommendedEmailContent"),l=document.getElementById("rationaleContent"),s=document.getElementById("acceptButton"),i=document.getElementById("discardButton");if(!(n&&a&&l&&s&&i))return void console.error("Email Analysis Result Dialog Error: Elements not found in the external HTML");const c=e.recommendedEmail.replace(/\n/g,"<br>");a.innerHTML=c;let g="";if("string"==typeof e.rationale)g=e.rationale.replace(/\n/g,"<br>");else if("object"==typeof e.rationale)for(const[t,o]of Object.entries(e.rationale))g+="string"==typeof o?`<strong>${t}:</strong> ${o.replace(/\n/g,"<br>")}<br>`:`<strong>${t}:</strong> ${o}<br>`;else g="Email Analysis Result Dialog: No rationale provided by AI.";l.innerHTML=g,n.showModal(),d||function(){const e=document.getElementById("toneDropdown");if(!e)return void console.error("Email Analysis Result Dialog: Tone Dropdown not found");d=!0;const t=localStorage.getItem("selectedTone")||"professional";e.value=t,e.addEventListener("change",(e=>{const t=e.target.value;localStorage.setItem("selectedTone",t),console.log(`Selected tone saved: ${t}`);const o=document.getElementById("betterMyEmailDialog");o&&o.close(),console.log("Calling fetchBetterMyEmailAPI due to tone change..."),f().then((()=>{console.log("Email Analysis Result Tone Dropdown: fetchBetterMyEmailAPI() called successfully")})).catch((e=>{console.error("Email Analysis Result Tone Dropdown: fetchBetterMyEmailAPI() failed:",e)}))}))}(),s.onclick=()=>{r.shouldShowFeedbackPopup()&&(console.log("Email Analysis Result Dialog: Accept Button Clicked, showing Feedback Form"),m.showFeedbackForm()),function(e){const t=document.querySelector('[role="textbox"][aria-label*="Message Body"]');t?t.innerHTML=e.replace(/\n/g,"<br>"):console.error("Email Analysis Result Dialog:: Email Content Element not found")}(e.recommendedEmail),n.close(),r.incrementUsage(!0),u()},i.onclick=()=>{r.shouldShowFeedbackPopup()&&(console.log("Email Analysis Result Dialog: Discard Button Clicked, showing Feedback Form"),m.showFeedbackForm()),n.close(),r.incrementUsage(!1),u()},n.addEventListener("close",(()=>{console.log("Email Analysis Result Dialog: Dialog closed")}))})).catch((e=>console.error("Email Analysis Result Dialog: Failed to load the analysis result UI:",e)))}({recommendedEmail:a,rationale:l})})).catch((e=>{console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}))):console.error("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found")}catch(e){console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}}))}function b(){const e=document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');if(e&&e.parentNode){if(!e.nextSibling||"Better My Email"!==e.nextSibling.textContent){const t=function(){const e=document.createElement("button");return e.textContent="Better My Email",e.style.cssText="background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;",e.onclick=f,e}();e.parentNode.insertBefore(t,e.nextSibling)}console.log("betterMyEmailPlugin.js: Send Button Found.")}else setTimeout(b,1e3)}function p(e){let t=e;return[/\[Your Name\]/g,/\[Your Position\]/g,/\[Your Company\]/g,/\[Your Team\]/g,/\[Your Contact Information\]/g,/\[Recipient's Name\]/g,/\[Recipient's Position\]/g,/\[Recipient's Company\]/g,/\[Your Company\/Team Name\]/g,/\[Insert .*?\]/g].forEach((e=>{t=t.replace(e,"").trim()})),t}console.log("betterMyEmailPlugin.js - Start"),function(){console.log("betterMyEmailPlugin.ts: Script executing immediately after load"),function(){let e=localStorage.getItem("userUUID");e&&null!==e&&"null"!==e&&"undefined"!==e&&""!==e?console.log("Existing User with UUID: ",e):(e=s(),null!==e&&localStorage.setItem("userUUID",e.toString()));let t=localStorage.getItem("userEmailID");console.log("betterMyEmailPlugin.ts: Browser Storage User Email ID: ",t),t&&null!==t&&"null"!==t&&"undefined"!==t&&""!==t?console.log("*********************&&&&&&&&&&&&&&&&&&&*********************"):chrome.storage.local.get("storedEmail",(o=>{o&&o.storedEmail?(t=o.storedEmail,console.log("betterMyEmailPlugin.ts:Chrome Storage :  User Email ID found: ",t),t&&(localStorage.setItem("userEmailID",t),console.log("betterMyEmailPlugin.ts: Storing Email ID in Browsers Local Storage: ",t),function(e,t){g(this,void 0,void 0,(function*(){console.log("betterMyEmailPlugin.ts: createUser() User Email ID: ",e," User UUID: ",t);const o=(yield y()).app_URL+"/createUser";console.log("betterMyEmailPlugin.ts: createUser() Create User URL: ",o," User Email ID: ",e," User UUID: ",t),yield fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({emailID:e,UUID:t})})}))}(t,e))):console.log("betterMyEmailPlugin.ts: Chrome Storage: User Email ID not found in Local Storage")}))}();new MutationObserver((e=>{e.forEach((e=>{e.addedNodes.length>0&&b()}))})).observe(document.body,{childList:!0,subtree:!0}),b(),document.body.insertAdjacentHTML("beforeend",(console.log("Spinner : getSpinnerHTML called"),'\n        <div id="betterMyEmailSpinner" style="display:none; position: fixed; z-index: 999999; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">\n            <div style="border: 8px solid #f3f3f3; border-radius: 50%; border-top: 8px solid #3498db; width: 60px; height: 60px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;"></div>\n        </div>\n\n        <style>\n            @-webkit-keyframes spin {\n            0% { -webkit-transform: rotate(0deg); }\n            100% { -webkit-transform: rotate(360deg); }\n            }\n\n            @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n            }\n        </style>\n    '))}()})();