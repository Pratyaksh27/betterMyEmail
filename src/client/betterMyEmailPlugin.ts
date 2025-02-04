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

    let userEmail = localStorage.getItem('userEmailID');
    console.log('betterMyEmailPlugin.ts: Browser Storage User Email ID: ', userEmail);
    if (!userEmail || userEmail === null || userEmail === 'null' || userEmail === 'undefined' || userEmail === '') {
        chrome.storage.local.get("storedEmail", (data) => {
            
            if (!data || !data.storedEmail) {
                console.log('betterMyEmailPlugin.ts: Chrome Storage: User Email ID not found in Local Storage');
                return;
            }
            userEmail = data.storedEmail;
            console.log('betterMyEmailPlugin.ts:Chrome Storage :  User Email ID found: ', userEmail);
            if (userEmail) {
                localStorage.setItem('userEmailID', userEmail);
                console.log('betterMyEmailPlugin.ts: Storing Email ID in Browsers Local Storage: ', userEmail);
                createUser(userEmail, uuid);
            }

        });
    } else {
        console.log('*********************&&&&&&&&&&&&&&&&&&&*********************')
    }

}

async function createUser(userEmailID: string, userUUID: string) {
    console.log('betterMyEmailPlugin.ts: createUser() User Email ID: ', userEmailID, ' User UUID: ', userUUID);
    const configs = await getConfigs();
    const create_user_url = configs.app_URL + '/createUser';
    console.log('betterMyEmailPlugin.ts: createUser() Create User URL: ', create_user_url, ' User Email ID: ', userEmailID, ' User UUID: ', userUUID);
    await fetch(create_user_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            emailID: userEmailID,
            UUID: userUUID
        })
    })
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

export async function fetchBetterMyEmailAPI(event: Event) {
    console.log('betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI');
    // Show the spinner
    document.getElementById('betterMyEmailSpinner')!.style.display = 'block';
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    if (!emailContentElement) {
        console.error('betterMyEmailPlugin.ts: Email content not found');
        return;
    }
    let currentEmailContentWithSignatureHTML = extractCurrentEmail(emailContentElement?.innerHTML || '');
    let { body: currentEmailContentHTML, signature } = extractSignature(currentEmailContentWithSignatureHTML);
    currentEmailContentHTML = removePlaceholders(currentEmailContentHTML);
    let currentEmailContentPlainText = extractPlainText(currentEmailContentHTML);

    console.log('Email Body:', currentEmailContentPlainText);
    console.log('Email Body HTML:', currentEmailContentHTML);
    console.log('Email Signature:', signature);

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
                    emailContent: currentEmailContentHTML,
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
                let recommendedEmailContent = analysisResultJson.recommended_email;
                recommendedEmailContent = removePlaceholders(recommendedEmailContent);
                const recommendedEmail = `${recommendedEmailContent}${signature}`;
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
        console.log('betterMyEmailPlugin.js: Send Button Found.');
    } else {
        setTimeout(addBetterMyEmailButton, 1000);  // Retry after 1 second
    }
}

function extractSignature(emailContent: string): { body: string, signature: string } {
    const signatureRegexes = [
        /<div class="gmail_signature">[\s\S]*<\/div>/s, // Gmail signatures
        /<table[\s\S]*?<\/table>/s, // Table-based signatures
        /<tr[\s\S]*<\/tr>/s, // Row-based signatures
        /<td[^>]*border-top:[^>]*>[\s\S]*?<\/td>/s, // TD with border-top
    ];

    let signature = '';
    let body = emailContent;

    for (const regex of signatureRegexes) {
        const match = body.match(regex);
        if (match) {
            signature = match[0];
            body = body.replace(signature, '').trim();
            break;
        }
    }

    return { body, signature };
}

function removePlaceholders(emailContent: string): string {
    // List of placeholders to be removed
    const placeholders = [
        /\[Your Name\]/g,
        /\[Your Position\]/g,
        /\[Your Company\]/g,
        /\[Your Team\]/g,
        /\[Your Contact Information\]/g,
        /\[Recipient's Name\]/g,
        /\[Recipient's Position\]/g,
        /\[Recipient's Company\]/g,
        /\[Your Company\/Team Name\]/g,
        /\[Insert .*?\]/g, // Matches generic "Insert [something]" placeholders
    ];

    let cleanedContent = emailContent;

    // Remove each placeholder
    placeholders.forEach(placeholder => {
        cleanedContent = cleanedContent.replace(placeholder, '').trim();
    });

    return cleanedContent;
}

function extractPlainText(htmlContent: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent; // Parse the HTML
    return tempDiv.textContent || ''; // Return plain text
}

function extractCurrentEmail(emailHTML: string): string {
    // Common markers indicating the start of an email thread
    const threadMarkers = [
        /On .* wrote:/, // Matches "On <date>, <person> wrote:"
        /Forwarded message:/, // Matches "Forwarded message:"
        /-----Original Message-----/, // Matches "-----Original Message-----"
    ];

    // Find and isolate the current email content
    let trimmedHTML = emailHTML;
    for (const marker of threadMarkers) {
        const match = trimmedHTML.match(marker);
        if (match) {
            trimmedHTML = trimmedHTML.slice(0, match.index).trim(); // Trim everything after the marker
            break;
        }
    }

    return trimmedHTML;
}


