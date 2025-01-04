import { UsageTrackingManager } from "../user_feedback/usageTracking";
import { FeedbackUI } from "../user_feedback/feedbackUI";
import { getConfigs } from '../betterMyEmailPlugin';
import { fetchBetterMyEmailAPI } from '../betterMyEmailPlugin';


// Initialize the FeedbackUI
let toneDropdownInitialized = false;
const feedbackUI = new FeedbackUI();
feedbackUI.injectFeedbackForm().then(() => {
    console.log('Email Analysis Result Dialog: Feedback Form injected successfully');
});

export function showBetterMyEmailResultDialog(data: { recommendedEmail: string; rationale: string }) {
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
                console.error('Email Analysis Result Dialog Error: Elements not found in the external HTML');
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
                formattedRationale = 'Email Analysis Result Dialog: No rationale provided by AI.';
            }
            rationaleContent.innerHTML = formattedRationale;

            // Show the dialog
            dialog.showModal();
            // Initialize the tone dropdown
            if (!toneDropdownInitialized){ initializeToneDropdown(); } 

            // Accept Button Logic
            acceptButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Email Analysis Result Dialog: Accept Button Clicked, showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                replaceEmailContent(data.recommendedEmail);
                dialog.close();
                UsageTrackingManager.incrementUsage(true);
                updateUsageCountinDB();
            };

            // Discard Button Logic
            discardButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Email Analysis Result Dialog: Discard Button Clicked, showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                dialog.close();
                UsageTrackingManager.incrementUsage(false);
                updateUsageCountinDB();
            };

            // Optional: Log when the dialog is closed
            dialog.addEventListener('close', () => {
                console.log('Email Analysis Result Dialog: Dialog closed');
            });
        })
        .catch(error => console.error('Email Analysis Result Dialog: Failed to load the analysis result UI:', error));
}

function replaceEmailContent(recommendedEmailContent: string) {
    const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    if (emailContentElement) {
        // TODO : For Security use DOMPurify for sanitizing the HTML
        emailContentElement.innerHTML = recommendedEmailContent.replace(/\n/g, '<br>');
    } else {
        console.error('Email Analysis Result Dialog:: Email Content Element not found');
    }
}

async function updateUsageCountinDB() {
    console.log('emailAnalysisResultDialog.ts: Inside updateUsageCount');
    let total_uses = localStorage.getItem(UsageTrackingManager.totalUsesKey);
    let uses_since_last_feedback = localStorage.getItem(UsageTrackingManager.usesSinceLastFeedbackKey);
    let uuid = localStorage.getItem('userUUID');
    let recommendations_accepted = localStorage.getItem(UsageTrackingManager.recommendationsAcceptedKey);
    let recommendations_discarded = localStorage.getItem(UsageTrackingManager.recommendationsDiscardedKey);

    console.log('emailAnalysisResultDialog.ts: Usage Stats: ', { uuid,total_uses,uses_since_last_feedback,recommendations_accepted,recommendations_discarded });
    const payload = {
        uuid: uuid,
        total_uses: total_uses,
        uses_since_last_feedback: uses_since_last_feedback,
        recommendations_accepted: recommendations_accepted,
        recommendations_discarded: recommendations_discarded
    };
    try {
        const configs = await getConfigs();
        const submit_usage_url = configs.app_URL + '/submitUsageStats';
        console.log('emailAnalysisResultDialog.ts: Updating Usage Stats to:', submit_usage_url);
        const response = await fetch(submit_usage_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log('Usage Stats submitted successfully.');
        }
    } catch (error) {
        console.error('Error submitting usage stats:', error);
    }
}

// This function initializes the tone dropdown and saves the selected tone to Local Storage
// The tone can be Professional, Friendly etc.This is used in the Email Analysis Result Dialog
// Its a sticky setting that persists across sessions. We use Local Storage
function initializeToneDropdown() {
    const toneDropdown = document.getElementById('toneDropdown') as HTMLSelectElement;
    if (!toneDropdown) {
        console.error('Email Analysis Result Dialog: Tone Dropdown not found');
        return;
    }
    toneDropdownInitialized = true;
    const savedTone = localStorage.getItem('selectedTone') || 'professional';
    toneDropdown.value = savedTone;

    // Save the tone to Local Storage when the user changes the selection
    toneDropdown.addEventListener('change', (event) => {
        const selectedTone = (event.target as HTMLSelectElement).value;
        localStorage.setItem('selectedTone', selectedTone);
        console.log(`Selected tone saved: ${selectedTone}`);

        const dialog = document.getElementById('betterMyEmailDialog') as HTMLDialogElement;
        if (dialog)
        {
            dialog.close();
        }
        
        // Automatically call the fetchBetterMyEmailAPI when tone changes
        console.log('Calling fetchBetterMyEmailAPI due to tone change...');
        fetchBetterMyEmailAPI(event)
        .then(() => {
            console.log('Email Analysis Result Tone Dropdown: fetchBetterMyEmailAPI() called successfully');
        })
        .catch((error) => {
            console.error('Email Analysis Result Tone Dropdown: fetchBetterMyEmailAPI() failed:', error);
        });
    });
}
