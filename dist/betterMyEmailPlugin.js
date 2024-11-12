"use strict";
//import { div } from 'react';
//import { send } from "process";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
End User can evaluate an email they’ve written to “Better my email” before sending.
The Plugin will “evaluate” the email and give personalized recommendations.
Users can Accept/Discard the suggestion

USer Clicks on Send Button. He is taken to a Plugin asking if he wishes to Better their email.
*/
console.log('betterMyEmailPlugin.js - Start');
function getConfigs() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['config'], function (result) {
            if (result.config) {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs found: ', result.config);
                resolve(result.config);
            }
            else {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs NOT found');
                reject(new Error('Configs not found'));
            }
        });
    });
}
function fetchBetterMyEmailAPI(event) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI');
        // Show the spinner
        document.getElementById('betterMyEmailSpinner').style.display = 'block';
        const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
        const emailContent = emailContentElement ? emailContentElement.textContent : '';
        console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ', emailContent);
        try {
            const configs = yield getConfigs();
            console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ', configs);
            if (configs && configs.analysis_URL) {
                console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ', configs.analysis_URL);
                // Show a loading modal to the user while the LLM generates a response
                // showLoadingModal();
                yield fetch(`${configs.analysis_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ emailContent: emailContent })
                })
                    .then(response => {
                    console.log('betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: ');
                    console.log('betterMyEmailPlugin.ts: Better my Email Analysis Response: ', response);
                    return response.json();
                })
                    .then(data => {
                    if (!data) {
                        console.error('betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis');
                        return;
                    }
                    else if (!data.analysisResult) {
                        console.error('betterMyEmailPlugin.ts Error: Data does not have a analysisResult property');
                        return;
                    }
                    let analysisResultJson;
                    try {
                        const jsonString = data.analysisResult.replace(/```json|```/g, '').trim();
                        analysisResultJson = JSON.parse(jsonString);
                    }
                    catch (error) {
                        console.error('betterMyEmailPlugin.ts Error: Parsing analysisResult JSON: ', error);
                        console.error('Received BetterMyEmail analysisResult JSON: ', data.analysisResult);
                        return;
                    }
                    const recommendedEmail = analysisResultJson.recommended_email;
                    const rationale = analysisResultJson.rationale;
                    console.log('betterMyEmailPlugin.ts: Recommended Email: ', recommendedEmail);
                    console.log('betterMyEmailPlugin.ts: Rationale: ', rationale);
                    // Hide the spinner when data is received
                    document.getElementById('betterMyEmailSpinner').style.display = 'none';
                    showBetterMyEmailResultDialog({ recommendedEmail, rationale });
                })
                    .catch(error => {
                    console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
                });
            }
            else {
                console.error('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found');
            }
        }
        catch (error) {
            console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
        }
    });
}
function createBetterMyEmailButton() {
    const button = document.createElement('button');
    button.textContent = 'Better My Email';
    button.style.cssText = 'background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;';
    button.onclick = fetchBetterMyEmailAPI;
    return button;
}
function addBetterMyEmailButton() {
    const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
    if (sendButton && sendButton.parentNode) {
        if (!sendButton.nextSibling || sendButton.nextSibling.textContent !== 'Better My Email') {
            const betterMyEmailButton = createBetterMyEmailButton();
            sendButton.parentNode.insertBefore(betterMyEmailButton, sendButton.nextSibling);
        }
        console.log('betterMyEmailPlugin.js: Send Button Found');
    }
    else {
        //console.log('betterMyEmailPlugin.js: Send Button NOT Found. Will check again.');
        setTimeout(addBetterMyEmailButton, 1000); // Retry after 1 second
    }
}
function showBetterMyEmailResultDialog(data) {
    const dialog = document.getElementById('betterMyEmailDialog');
    const content = document.getElementById('betterMyEmailDialogContent');
    const acceptButton = document.getElementById('acceptButton');
    const discardButton = document.getElementById('discardButton');
    if (!dialog || !content || !acceptButton || !discardButton) {
        console.error('betterMyEmailPlugin.ts: Dialog element not found');
        return;
    }
    // Replace line breaks in the recommended email
    const recommendedEmailContent = data.recommendedEmail.replace(/\n/g, '<br>');
    // We had a bug where the rationale being returned was sometimes a string
    // and sometimes an object. So we handle rationale based on its type
    let rationaleContent = '';
    if (typeof data.rationale === 'string') {
        rationaleContent = data.rationale.replace(/\n/g, '<br>');
    }
    else if (typeof data.rationale === 'object') {
        // Convert the rationale object to an HTML string, applying .replace for each value
        for (const [key, value] of Object.entries(data.rationale)) {
            if (typeof value === 'string') {
                rationaleContent += `<strong>${key}:</strong> ${value.replace(/\n/g, '<br>')}<br>`;
            }
            else {
                rationaleContent += `<strong>${key}:</strong> ${value}<br>`; // Handle non-string values (if needed)
            }
        }
    }
    else {
        rationaleContent = 'No rationale provided.';
    }
    content.innerHTML = `
        <h2>Recommended Email:</h2>
        <div id="recommendedEmailContent">${recommendedEmailContent}</div>
        <h2>Rationale for the Recommendation:</h2>
        <div>${rationaleContent}</div>
        `;
    dialog.showModal();
    acceptButton.onclick = function () {
        replaceEmailContent(data.recommendedEmail);
        dialog.close();
    };
    discardButton.onclick = function () {
        dialog.close();
    };
    dialog.addEventListener('close', function () {
        console.log('betterMyEmailPlugin.ts: Dialog closed');
    });
}
function replaceEmailContent(recommendedEmailContent) {
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    if (emailContentElement) {
        // TODO : For Security use DOMPurify for sanitizing the HTML
        emailContentElement.innerHTML = recommendedEmailContent.replace(/\n/g, '<br>');
    }
    else {
        console.error('betterMyEmailPlugin.ts: Email Content Element not found');
    }
}
function getSpinnerHTML() {
    return `
        <div id="betterMyEmailSpinner" style="display:none; position: fixed; z-index: 999; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <div style="border: 8px solid #f3f3f3; border-radius: 50%; border-top: 8px solid #3498db; width: 60px; height: 60px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;"></div>
        </div>

        <style>
            @-webkit-keyframes spin {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
            }

            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
        </style>
    `;
}
(function () {
    console.log('Script executing immediately after load');
    let sendButtonProcessed = false;
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                // console.log('betterMyEmailPlugin.js: Mutation observed - checking for Send button');
                //addSendButtonClickHandler();
                addBetterMyEmailButton();
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    function restartObserver() {
        observer.observe(document.body, { childList: true, subtree: true });
        addBetterMyEmailButton();
    }
    addBetterMyEmailButton();
    // Inject the dialog HTML into the DOM
    // This dialog will be used to display the Better my Email Analysis result
    const dialogEmailAnalysisResultHTML = `
        <dialog id="betterMyEmailDialog" style="width: 750px !important;">
            <form method="dialog">
                <h1>Better My Email Result:</h1>
                <p id="betterMyEmailDialogContent"></p>
                <menu>
                    <button id="acceptButton" type="button">Accept</button>
                    <button id="discardButton" type="button">Discard</button>
                </menu>
            </form>
    `;
    document.body.insertAdjacentHTML('beforeend', dialogEmailAnalysisResultHTML);
    document.body.insertAdjacentHTML('beforeend', getSpinnerHTML());
})();
