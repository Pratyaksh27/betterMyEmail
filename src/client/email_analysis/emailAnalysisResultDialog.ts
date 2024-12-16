import { UsageTrackingManager } from "../user_feedback/usageTracking";
import { FeedbackUI } from "../user_feedback/feedbackUI";


// Initialize the FeedbackUI
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

            // Accept Button Logic
            acceptButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Email Analysis Result Dialog: Accept Button Clicked, showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                replaceEmailContent(data.recommendedEmail);
                dialog.close();
            };

            // Discard Button Logic
            discardButton.onclick = () => {
                if (UsageTrackingManager.shouldShowFeedbackPopup()) {
                    console.log('Email Analysis Result Dialog: Discard Button Clicked, showing Feedback Form');
                    feedbackUI.showFeedbackForm();
                }
                dialog.close();
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