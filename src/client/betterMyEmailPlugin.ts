import { v4 as uuidv4 } from 'uuid';
import { showBetterMyEmailResultDialog } from "./email_analysis/emailAnalysisResultDialog";
import { getSpinnerHTML } from "./email_analysis/spinner";
/*
End User can evaluate an email they’ve written to “Better my email” before sending. 
The Plugin will “evaluate” the email and give personalized recommendations. 
Users can Accept/Discard the suggestion

USer Clicks on Send Button. He is taken to a Plugin asking if he wishes to Better their email.
*/


console.log('betterMyEmailPlugin.js - Start');
(function() {
    console.log('betterMyEmailPlugin.ts: Script executing immediately after load');
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
    document.body.insertAdjacentHTML('beforeend', getSpinnerHTML());

})();
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
    console.log('betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI');
    // Show the spinner
    document.getElementById('betterMyEmailSpinner')!.style.display = 'block';
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    const emailContent = emailContentElement ? emailContentElement.textContent : '';
    console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ', emailContent);

    // Get the selected tone from Local Storage
    const selectedTone = localStorage.getItem('selectedTone') || 'professional';
    console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Selected Tone: ', selectedTone);
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
                body: JSON.stringify({ 
                    emailContent: emailContent,
                    selectedTone: selectedTone,
                })
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

