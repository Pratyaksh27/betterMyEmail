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
(function () {
    console.log('Script executing immediately after load');
    let sendButtonProcessed = false;
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
                        console.log('Received Data', data);
                        console.log('betterMyEmailPlugin.ts: Better my Email Analysis Result: ', data.analysisResult);
                        //Display the Better my Email Analysis result to the user
                        /*const betterMyEmailResult = window.confirm(`Better my Email Analysis Result:\n\n${data.analysisResult}`);
                        if (betterMyEmailResult) {
                            console.log('betterMyEmailPlugin.ts: User accepted the Better my Email Analysis result');
                        } else {
                            console.log('betterMyEmailPlugin.ts: User discarded the Better my Email Analysis result');
                        }*/
                        showBetterMyEmailResultDialog(data);
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
    function addBetterMyEmailButton() {
        const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
        if (sendButton && sendButton.parentNode) {
            if (!sendButton.nextSibling || sendButton.nextSibling.textContent !== 'Better My Email') {
                const betterMyEmailButton = document.createElement('button');
                betterMyEmailButton.textContent = 'Better My Email';
                betterMyEmailButton.style.cssText = 'background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;';
                betterMyEmailButton.onclick = fetchBetterMyEmailAPI;
                sendButton.parentNode.insertBefore(betterMyEmailButton, sendButton.nextSibling);
            }
            console.log('betterMyEmailPlugin.js: Send Button Found');
        }
        else {
            //console.log('betterMyEmailPlugin.js: Send Button NOT Found. Will check again.');
            setTimeout(addBetterMyEmailButton, 1000); // Retry after 1 second
        }
    }
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
                    <button value="default">Okay</button>
                </menu>
            </form>
    `;
    document.body.insertAdjacentHTML('beforeend', dialogEmailAnalysisResultHTML);
    function showBetterMyEmailResultDialog(data) {
        const dialog = document.getElementById('betterMyEmailDialog');
        const content = document.getElementById('betterMyEmailDialogContent');
        if (!dialog || !content) {
            console.error('betterMyEmailPlugin.ts: Dialog element not found');
            return;
        }
        //content.textContent = data.analysisResult;
        const formattedData = data.analysisResult.replace(/\n/g, '<br>');
        content.innerHTML = formattedData;
        dialog.showModal();
        dialog.addEventListener('close', function () {
            console.log('betterMyEmailPlugin.ts: Dialog closed');
        });
    }
    // The following modal will be shown to the user while they wait for the LLM to generate a response
    // The modal will Fade out automatically after 5 seconds
    const dialogLoadingHTML = `
        <div id="betterMyEmailLoadingModal" class="modal">
            <div class="modal-content">
                <h1>Loading...</h1>
                <p>Please wait upto 15 seconds while we analyze your email...</p>
            </div>
    `;
    //document.body.insertAdjacentHTML('beforeend', dialogLoadingHTML);
    function showLoadingModal() {
        console.log('betterMyEmailPlugin.ts: Showing loading modal');
        const loadingModal = document.getElementById('betterMyEmailLoadingModal');
        if (loadingModal) {
            console.log('betterMyEmailPlugin.ts: Loading modal Found');
            loadingModal.style.display = 'block';
            setTimeout(() => {
                loadingModal.style.display = 'none';
            }, 5000);
        }
        else {
            console.error('betterMyEmailPlugin.ts: Loading modal NOT Found');
        }
    }
})();
