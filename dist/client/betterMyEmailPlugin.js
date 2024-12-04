(()=>{"use strict";class e{static getFeedbackData(){return{totalUses:localStorage.getItem(e.totalUsesKey),lastFeedbackTime:localStorage.getItem(e.lastFeedbackTimeKey),lastFeedbackGiven:localStorage.getItem(e.lastFeedbackGivenKey),usesSinceLastFeedback:localStorage.getItem(e.usesSinceLastFeedbackKey)}}static resetFeedbackData(){localStorage.removeItem(e.totalUsesKey),localStorage.removeItem(e.lastFeedbackTimeKey),localStorage.removeItem(e.lastFeedbackGivenKey),localStorage.removeItem(e.usesSinceLastFeedbackKey)}static incrementUsage(){let t=parseInt(localStorage.getItem(e.totalUsesKey)||"0");t++,localStorage.setItem(e.totalUsesKey,t.toString());let n=parseInt(localStorage.getItem(e.usesSinceLastFeedbackKey)||"0");n++,localStorage.setItem(e.usesSinceLastFeedbackKey,n.toString()),console.log("Incremented usage"),console.log("Total Uses: "+t),console.log("Uses Since Last Feedback: "+n)}static shouldShowFeedbackPopup(){const t=localStorage.getItem(e.lastFeedbackGivenKey||"false"),n=parseInt(localStorage.getItem(e.usesSinceLastFeedbackKey)||"0");if(null===localStorage.getItem(e.lastFeedbackGivenKey)&&localStorage.setItem(e.lastFeedbackGivenKey,"false"),"true"===t){let t=n>=5;return t&&localStorage.setItem(e.usesSinceLastFeedbackKey,"0"),t}if("false"===t){let t=n>=3;return t&&localStorage.setItem(e.usesSinceLastFeedbackKey,"0"),t}return!1}}e.totalUsesKey="totalUses",e.lastFeedbackTimeKey="lastFeedbackTime",e.lastFeedbackGivenKey="lastFeedbackGiven",e.usesSinceLastFeedbackKey="usesSinceLastFeedback";var t=function(e,t,n,o){return new(n||(n=Promise))((function(l,a){function i(e){try{r(o.next(e))}catch(e){a(e)}}function s(e){try{r(o.throw(e))}catch(e){a(e)}}function r(e){var t;e.done?l(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,s)}r((o=o.apply(e,t||[])).next())}))};function n(n){return t(this,void 0,void 0,(function*(){e.incrementUsage(),console.log("betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI"),document.getElementById("betterMyEmailSpinner").style.display="block";const t=document.querySelector('[role="textbox"][aria-label*="Message Body"]'),n=t?t.textContent:"";console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ",n);try{const t=yield new Promise(((e,t)=>{chrome.storage.sync.get(["config"],(function(n){n.config?(console.log("betterMyEmailPlugin.ts: getConfigs() Configs found: ",n.config),e(n.config)):(console.log("betterMyEmailPlugin.ts: getConfigs() Configs NOT found"),t(new Error("Configs not found")))}))}));console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ",t),t&&t.analysis_URL?(console.log("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ",t.analysis_URL),yield fetch(`${t.analysis_URL}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({emailContent:n})}).then((e=>(console.log("betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: "),console.log("betterMyEmailPlugin.ts: Better my Email Analysis Response: ",e),e.json()))).then((t=>{if(!t)return void console.error("betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis");if(!t.analysisResult)return void console.error("betterMyEmailPlugin.ts Error: Data does not have a analysisResult property");let n;try{const e=t.analysisResult.replace(/```json|```/g,"").trim();n=JSON.parse(e)}catch(e){return console.error("betterMyEmailPlugin.ts Error: Parsing analysisResult JSON: ",e),void console.error("Received BetterMyEmail analysisResult JSON: ",t.analysisResult)}const o=n.recommended_email,l=n.rationale;console.log("betterMyEmailPlugin.ts: Recommended Email: ",o),console.log("betterMyEmailPlugin.ts: Rationale: ",l),document.getElementById("betterMyEmailSpinner").style.display="none",function(t){const n=document.getElementById("betterMyEmailDialog"),o=document.getElementById("betterMyEmailDialogContent"),l=document.getElementById("acceptButton"),a=document.getElementById("discardButton");if(!(n&&o&&l&&a))return void console.error("betterMyEmailPlugin.ts: Dialog element not found");const i=t.recommendedEmail.replace(/\n/g,"<br>");let s="";if("string"==typeof t.rationale)s=t.rationale.replace(/\n/g,"<br>");else if("object"==typeof t.rationale)for(const[e,n]of Object.entries(t.rationale))s+="string"==typeof n?`<strong>${e}:</strong> ${n.replace(/\n/g,"<br>")}<br>`:`<strong>${e}:</strong> ${n}<br>`;else s="No rationale provided.";o.innerHTML=`\n        <h2>Recommended Email:</h2>\n        <div id="recommendedEmailContent">${i}</div>\n        <h2>Rationale for the Recommendation:</h2>\n        <div>${s}</div>\n        `,n.showModal(),l.onclick=function(){e.shouldShowFeedbackPopup()&&console.log("betterMyEmailPlugin.ts Accept Button Clicked: Showing Feedback Form"),function(e){const t=document.querySelector('[role="textbox"][aria-label*="Message Body"]');t?t.innerHTML=e.replace(/\n/g,"<br>"):console.error("betterMyEmailPlugin.ts: Email Content Element not found")}(t.recommendedEmail),n.close()},a.onclick=function(){e.shouldShowFeedbackPopup()&&console.log("betterMyEmailPlugin.ts Discard Button Clicked: Showing Feedback Form"),n.close()},n.addEventListener("close",(function(){console.log("betterMyEmailPlugin.ts: Dialog closed")}))}({recommendedEmail:o,rationale:l})})).catch((e=>{console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}))):console.error("betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found")}catch(e){console.error("betterMyEmailPlugin.ts: Error in Better my Email Analysis: ",e)}e.shouldShowFeedbackPopup()?console.log("betterMyEmailPlugin.ts: Showing Feedback Form"):console.log("betterMyEmailPlugin.ts: Not showing Feedback Form")}))}function o(){const e=document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');if(e&&e.parentNode){if(!e.nextSibling||"Better My Email"!==e.nextSibling.textContent){const t=function(){const e=document.createElement("button");return e.textContent="Better My Email",e.style.cssText="background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;",e.onclick=n,e}();e.parentNode.insertBefore(t,e.nextSibling)}console.log("betterMyEmailPlugin.js: Send Button Found")}else setTimeout(o,1e3)}console.log("betterMyEmailPlugin.js - Start"),function(){console.log("Script executing immediately after load");new MutationObserver((e=>{e.forEach((e=>{e.addedNodes.length>0&&o()}))})).observe(document.body,{childList:!0,subtree:!0}),o(),document.body.insertAdjacentHTML("beforeend",'\n        <dialog id="betterMyEmailDialog" style="width: 750px !important;">\n            <form method="dialog">\n                <h1>Better My Email Result:</h1>\n                <p id="betterMyEmailDialogContent"></p>\n                <menu>\n                    <button id="acceptButton" type="button">Accept</button>\n                    <button id="discardButton" type="button">Discard</button>\n                </menu>\n            </form>\n    '),document.body.insertAdjacentHTML("beforeend",'\n        <div id="betterMyEmailSpinner" style="display:none; position: fixed; z-index: 999; top: 50%; left: 50%; transform: translate(-50%, -50%);">\n            <div style="border: 8px solid #f3f3f3; border-radius: 50%; border-top: 8px solid #3498db; width: 60px; height: 60px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;"></div>\n        </div>\n\n        <style>\n            @-webkit-keyframes spin {\n            0% { -webkit-transform: rotate(0deg); }\n            100% { -webkit-transform: rotate(360deg); }\n            }\n\n            @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n            }\n        </style>\n    ')}()})();