import { v4 as uuidv4 } from 'uuid';
import { showBetterMyEmailResultDialog } from "./email_analysis/emailAnalysisResultDialog";
import { getSpinnerHTML } from "./email_analysis/spinner";
import e from 'express';
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
    UUIDtoEmailMapping();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
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
async function UUIDtoEmailMapping() {
    console.log("Starting UUID to Email Mapping...");

    // Step 1: Ensure Email consistency between Local Storage and Extension Storage
    await EmailStorageMapping();

    // Step 2: Retrieve UUID & Email from Local Storage
    let uuid = localStorage.getItem("userUUID");
    let userEmail = localStorage.getItem("userEmailID");

    // Step 3: If UUID is missing but Email exists → Restore UUID from DB
    if (!uuid && userEmail) {
        console.log("UUID missing but Email exists. Retrieving UUID from DB...");
        const fetchedUUID = await getUUIDFromEmail(userEmail);
        if (fetchedUUID) {
            localStorage.setItem("userUUID", fetchedUUID);
            console.log("Restored UUID from DB:", fetchedUUID);
        } else {
            console.log("No UUID found in DB. Creating new UUID..");
            uuid = uuidv4();
            localStorage.setItem("userUUID", uuid);
            createUser(userEmail, uuid);
        }
    }
    // Step 4: If UUID exists but Email is missing → Restore Email from DB
    else if (uuid && !userEmail) {
        console.log("UUID exists but Email is missing. Retrieving Email from DB...");
        const fetchedEmail = await getEmailFromUUID(uuid);
        if (fetchedEmail) {
            localStorage.setItem("userEmailID", fetchedEmail);
            chrome.storage.sync.set({ storedEmail: fetchedEmail });
            console.log("Restored Email from DB:");
        }
    }
    // Step 5: If both UUID & Email are missing → Create new UUID
    else if (!uuid && !userEmail) {
        console.log("No UUID and No Email found. Generating a new UUID...");
        uuid = uuidv4();
        localStorage.setItem("userUUID", uuid);
    }
    else if (uuid && userEmail) {
        console.log("UUID & Email are already present.");
        const fetchedEmail = await getEmailFromUUID(uuid);
        if (!fetchedEmail) {
            // Both UUID and Email Found but User is not in DB, then Create User in DB
            console.log("Creating User in DB with existing UUID & Email...");
            createUser(userEmail, uuid);
        }
    }

}


// ✅ Helper Function: Ensure Email Consistency Between Local Storage & Extension Storage
// We are storing email address in 2 places, extension storage and local storage.
// Reason: Extension storage is persistent and local storage is accessible from content scripts.
async function EmailStorageMapping() {
    console.log("Ensuring Email Consistency Between Local Storage & Extension Storage");

    // Get Email from Local Storage
    let LSEmail = localStorage.getItem("userEmailID") || null;

    // ✅ Fetch Email from Extension Storage properly
    let ESEmail: string | null = await new Promise((resolve) => {
        chrome.storage.sync.get("storedEmail", (data) => {
            if (data && typeof data.storedEmail === "string") {
                resolve(data.storedEmail);
            } else {
                resolve(null);  // Ensure we always return null instead of an empty object
            }
        });
    });

    // ✅ Sync Emails Correctly
    if (ESEmail && !LSEmail) {
        localStorage.setItem("userEmailID", ESEmail);
        console.log("Synced ESEmail to LSEmail:");
    } else if (!ESEmail && LSEmail) {
        chrome.storage.sync.set({ storedEmail: LSEmail });
        console.log("Synced LSEmail to ESEmail:");
    } else if (ESEmail && LSEmail) {
        localStorage.setItem("userEmailID", ESEmail); // Ensure ES email takes priority
        console.log("Ensured ES priority while syncing emails in Local and Extension Storages");
    } else {
        console.log("No Email found in LS or ES.");
    }
}




async function createUser(userEmailID: string, userUUID: string) {
    console.log('betterMyEmailPlugin.ts: createUser() called with uuid and email ID');
    const configs = await getConfigs();
    const create_user_url = configs.app_URL + '/createUser';
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

/*
# Get UUID from Email ID
# API Gateway Endpoint: /getUUIDFromEmail
# Receives an email ID and returns the UUID associated with the email ID.
# If no UUID is found, it returns null. 
*/
async function getUUIDFromEmail(emailID: string) {
    console.log('betterMyEmailPlugin.ts: getUUIDFromEmail() called ');
    const configs = await getConfigs();
    const get_uuid_url = configs.app_URL + '/getUUIDFromEmail';
    try {
        const response = await fetch(get_uuid_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                emailID: emailID
            })
        });
        const data = await response.json();
        console.log('betterMyEmailPlugin.ts: getUUIDFromEmail() Successfully Called ');
        return data.uuid ? data.uuid : null;
    } catch (error) {
        console.error('betterMyEmailPlugin.ts: getUUIDFromEmail() Error: ', error);
        return null;
    }
}

/*
# Get Email ID from UUID
# API Gateway Endpoint: /getEmailFromUUID
# Receives a UUID and returns the email ID associated with the UUID.
# If no email ID is found, it returns null. 
*/
async function getEmailFromUUID(uuid: string) {
    console.log('betterMyEmailPlugin.ts: getEmailFromUUID() called');
    const configs = await getConfigs();
    const get_email_url = configs.app_URL + '/getEmailFromUUID';
    try {
        const response = await fetch(get_email_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                uuid: uuid
            })
        });
        const data = await response.json();
        console.log('betterMyEmailPlugin.ts: getEmailFromUUID() Successfully Called: ');
        return data.emailID ? data.emailID : null;
    } catch (error) {
        console.error('betterMyEmailPlugin.ts: getEmailFromUUID() Error: ', error);
        return null;
    }
}

export function getConfigs(): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['config'], function(result: any) {
            if (result.config) {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs found: ');
                resolve(result.config);
            } else {
                console.log('betterMyEmailPlugin.ts: getConfigs() Configs NOT found');
                reject(new Error('Configs not found.'));
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

    // Get the selected tone from Local Storage 
    const selectedTone = localStorage.getItem('selectedTone') || 'professional';
    console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Selected Tone: ', selectedTone);
    try {
        const configs = await getConfigs();
        console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ', configs);
        if (configs && configs.analysis_URL) {
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
                console.log('betterMyEmailPlugin.ts: Better my Email Analysis Responded: ');
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
                    return;
                }
                let recommendedEmailContent = analysisResultJson.recommended_email;
                recommendedEmailContent = removePlaceholders(recommendedEmailContent);
                const recommendedEmail = `${recommendedEmailContent}${signature}`;
                const rationale = analysisResultJson.rationale;
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


