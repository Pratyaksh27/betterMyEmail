//import { div } from 'react';
//import { send } from "process";
import { UsageTrackingManager } from "./user_feedback/usageTracking";
import { FeedbackUI } from "./user_feedback/feedbackUI";
import { v4 as uuidv4 } from 'uuid';
/*
End User can evaluate an email they’ve written to “Better my email” before sending. 
The Plugin will “evaluate” the email and give personalized recommendations. 
Users can Accept/Discard the suggestion

USer Clicks on Send Button. He is taken to a Plugin asking if he wishes to Better their email.
*/
console.log('betterMyEmailPlugin.js - Start');

// Initialize the FeedbackUI
const feedbackUI = new FeedbackUI();
feedbackUI.injectFeedbackForm().then(() => {
    console.log('Feedback Form injected successfully');
});

/*
# Ensure the user has a UUID stored in the local storage
# If not, generate a new UUID and store it in the local storage
*/
function ensureUUID() {
    let uuid = localStorage.getItem('userUUID');
    if (!uuid || uuid === null || uuid === 'null' || uuid === 'undefined' || uuid === '') {
        uuid = uuidv4();
        if (uuid !== null){
            localStorage.setItem('userUUID', uuid.toString());
        }      
    } else {
        console.log('Existing User with UUID: ', uuid);
    }
}

export function getConfigs(): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['config'], function(result: any) {
            if (result.config) {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs found: ', result.config);
                resolve(result.config);
            } else {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs NOT found');
                reject(new Error('Configs not found'));
            }
        });
    });
}

async function fetchBetterMyEmailAPI(event: Event) {
    // Increment the Usage count in the Feedback Manager
    UsageTrackingManager.incrementUsage();
    console.log('betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI');
    // Show the spinner
    document.getElementById('betterMyEmailSpinner')!.style.display = 'block';
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    const emailContent = emailContentElement ? emailContentElement.textContent : '';
    console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ', emailContent);
    try {
        const configs = await getConfigs();
        console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ', configs);
        if (configs && configs.analysis_URL) {
            console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ', configs.analysis_URL);
            // Show a loading modal to the user while the LLM generates a response
            // showLoadingModal();
            await fetch(`${configs.analysis_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emailContent: emailContent })
            })
            .then(response => {
                console.log('betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: ');
                console.log('betterMyEmailPlugin.ts: Better my Email Analysis Response: ', response);
                return response.json()
            })
            .then(data => {
                if (!data) {
                    console.error('betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis');
                    return;
                } else if (!data.analysisResult) {
                    console.error('betterMyEmailPlugin.ts Error: Data does not have a analysisResult property');
                    return;
                }
                let analysisResultJson;
                try{
                    const jsonString = data.analysisResult.replace(/```json|```/g, '').trim();
                    analysisResultJson = JSON.parse(jsonString);
                } catch (error) {
                    console.error('betterMyEmailPlugin.ts Error: Parsing analysisResult JSON: ', error);
                    console.error('Received BetterMyEmail analysisResult JSON: ', data.analysisResult);
                    return;
                }
                const recommendedEmail = analysisResultJson.recommended_email;
                const rationale = analysisResultJson.rationale;
                console.log('betterMyEmailPlugin.ts: Recommended Email: ', recommendedEmail);
                console.log('betterMyEmailPlugin.ts: Rationale: ', rationale);
                // Hide the spinner when data is received
                document.getElementById('betterMyEmailSpinner')!.style.display = 'none';
                showBetterMyEmailResultDialog({ recommendedEmail, rationale });
            })
            .catch(error => {
                console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
            });
            
        } else {
            console.error('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found');
        }
      
    } catch (error) {
        console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
    }
    // Should we show the Feedback Form
    /* if (UsageTrackingManager.shouldShowFeedbackPopup()) {
        console.log('betterMyEmailPlugin.ts: Showing Feedback Form');
    } else {
        console.log('betterMyEmailPlugin.ts: Not showing Feedback Form');
    }*/
} 

function createBetterMyEmailButton() {
    const button = document.createElement('button');
    button.textContent = 'Better My Email';
    button.style.cssText = 'background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;';
    button.onclick = fetchBetterMyEmailAPI;
    return button;
}

function addBetterMyEmailButton(){
    const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
    if (sendButton && sendButton.parentNode) {
        if (!sendButton.nextSibling || sendButton.nextSibling.textContent !== 'Better My Email') {
            const betterMyEmailButton = createBetterMyEmailButton();
            sendButton.parentNode.insertBefore(betterMyEmailButton, sendButton.nextSibling);
        }
        console.log('betterMyEmailPlugin.js: Send Button Found');
    } else {
        //console.log('betterMyEmailPlugin.js: Send Button NOT Found. Will check again.');
        setTimeout(addBetterMyEmailButton, 1000);  // Retry after 1 second
    }
}

function showBetterMyEmailResultDialog1(data:{ recommendedEmail: string; rationale: string }) {
    const dialog = document.getElementById('betterMyEmailDialog') as HTMLDialogElement;
    const content = document.getElementById('betterMyEmailDialogContent');
    const acceptButton = document.getElementById('acceptButton') as HTMLButtonElement;
    const discardButton = document.getElementById('discardButton') as HTMLButtonElement;

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
    } else if (typeof data.rationale === 'object') {
        // Convert the rationale object to an HTML string, applying .replace for each value
        for (const [key, value] of Object.entries(data.rationale)) {
            if (typeof value === 'string') {
                rationaleContent += `<strong>${key}:</strong> ${value.replace(/\n/g, '<br>')}<br>`;
            } else {
                rationaleContent += `<strong>${key}:</strong> ${value}<br>`; // Handle non-string values (if needed)
            }
        }
    } else {
        rationaleContent = 'No rationale provided.';
    }
    content.innerHTML = `
        <h2>Recommended Email:</h2>
        <div id="recommendedEmailContent">${recommendedEmailContent}</div>
        <h2>Rationale for the Recommendation:</h2>
        <div>${rationaleContent}</div>
        `;
    dialog.showModal();

    acceptButton.onclick = function() {
        // Check If Feedback form should be shown
        if (UsageTrackingManager.shouldShowFeedbackPopup()) {
            console.log('betterMyEmailPlugin.ts Accept Button Clicked: Showing Feedback Form');
            feedbackUI.showFeedbackForm();
        }
        replaceEmailContent(data.recommendedEmail);
        dialog.close();
    };
    discardButton.onclick = function() {
        if (UsageTrackingManager.shouldShowFeedbackPopup()) {
            console.log('betterMyEmailPlugin.ts Discard Button Clicked: Showing Feedback Form');
            feedbackUI.showFeedbackForm();
        }
        dialog.close();
    };

    dialog.addEventListener('close', function() {
        console.log('betterMyEmailPlugin.ts: Dialog closed');
    });
}

function replaceEmailContent(recommendedEmailContent: string) {
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    if (emailContentElement) {
        // TODO : For Security use DOMPurify for sanitizing the HTML
        emailContentElement.innerHTML = recommendedEmailContent.replace(/\n/g, '<br>');
    } else {
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

function showBetterMyEmailResultDialog(data: { recommendedEmail: string; rationale: string }) {
    // Fetch the external HTML file for the dialog
    fetch(chrome.runtime.getURL('dist/client/email_analysis/emailAnalysisResultUI.html'))
        .then(response => response.text())
        .then(html => {
            // Create a container and insert the fetched HTML
            const dialogContainer = document.createElement('div');
            dialogContainer.innerHTML = html;
            document.body.appendChild(dialogContainer);

            // Get references to dialog elements
            const dialog = document.getElementById('betterMyEmailDialog') as HTMLDialogElement;
            const recommendedEmailContent = document.getElementById('recommendedEmailContent');
            const rationaleContent = document.getElementById('rationaleContent');
            const acceptButton = document.getElementById('acceptButton') as HTMLButtonElement;
            const discardButton = document.getElementById('discardButton') as HTMLButtonElement;

            if (!dialog || !recommendedEmailContent || !rationaleContent || !acceptButton || !discardButton) {
                console.error('Error: Elements not found in the external HTML');
                return;
            }

            // Populate the Recommended Email Content
            const formattedEmail = data.recommendedEmail.replace(/\n/g, '<br>');
            recommendedEmailContent.innerHTML = formattedEmail;

            // Handle Rationale Content with Type Checking
            let formattedRationale = '';
            if (typeof data.rationale === 'string') {
                // If rationale is a string, format line breaks
                formattedRationale = data.rationale.replace(/\n/g, '<br>');
            } else if (typeof data.rationale === 'object') {
                // If rationale is an object, iterate through key-value pairs
                for (const [key, value] of Object.entries(data.rationale)) {
                    if (typeof value === 'string') {
                        formattedRationale += `<strong>${key}:</strong> ${value.replace(/\n/g, '<br>')}<br>`;
                    } else {
                        formattedRationale += `<strong>${key}:</strong> ${value}<br>`; // Handle non-string values
                    }
                }
            } else {
                formattedRationale = 'No rationale provided.';
            }
            rationaleContent.innerHTML = formattedRationale;

            // Show the dialog
            dialog.showModal();

            // Accept Button Logic
            acceptButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Accept Button Clicked: Showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                replaceEmailContent(data.recommendedEmail);
                dialog.close();
            };

            // Discard Button Logic
            discardButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Discard Button Clicked: Showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                dialog.close();
            };

            // Optional: Log when the dialog is closed
            dialog.addEventListener('close', () => {
                console.log('Dialog closed');
            });
        })
        .catch(error => console.error('Failed to load the analysis result UI:', error));
}


(function() {
    console.log('Script executing immediately after load');
    let sendButtonProcessed = false;
    // Ensure the user has a UUID stored in the local storage
    ensureUUID();

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

    function restartObserver(){
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
    // document.body.insertAdjacentHTML('beforeend', dialogEmailAnalysisResultHTML);

    document.body.insertAdjacentHTML('beforeend', getSpinnerHTML());

})();

