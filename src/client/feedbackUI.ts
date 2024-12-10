// feedbackUI.ts
// This file contains the FeedbackUI class that is responsible for showing and hiding the feedback form.
// It also handles the submission of feedback.
// This class will be used in the content script to show the feedback form to the user.

export class FeedbackUI {
    private selectedRating: number | null = null;

    constructor() {
        // We do not load the HTML here; that will be done by calling injectFeedbackForm()
    }

    public async injectFeedbackForm(): Promise<void> {
        try {
            const response = await fetch(chrome.runtime.getURL('dist/client/feedbackForm.html'));
            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html.trim();
            const styleEl = tempDiv.querySelector('style');
            if (styleEl) {
                document.head.appendChild(styleEl);
            } else {
                console.error('Feedback form styles not found in the loaded HTML.');
            }    

            const feedbackEl = tempDiv.querySelector('#feedbackFormContainer');
            if (feedbackEl) {
                document.body.appendChild(feedbackEl);
                this.initializeFeedbackFormEvents();
            } else {
                console.error('Feedback form container not found in the loaded HTML.');
            }
        } catch (error) {
            console.error('Error loading feedback form HTML:', error);
        }
    }

    private initializeFeedbackFormEvents(): void {
        const closeBtn = document.getElementById('feedbackCloseBtn') as HTMLButtonElement;
        const submitBtn = document.getElementById('feedbackSubmitBtn') as HTMLButtonElement;
        const emojiContainer = document.getElementById('feedbackEmojiContainer') as HTMLElement;
        const feedbackText = document.getElementById('feedbackText') as HTMLTextAreaElement;

        if (closeBtn) {
            closeBtn.onclick = () => {
                this.hideFeedbackForm();
            };
        }

        if (submitBtn) {
            submitBtn.onclick = () => {
                const textValue = feedbackText.value.trim();
                if (!this.selectedRating && !textValue) {
                    alert('Please provide a rating or some text feedback.');
                    return;
                }
                this.submitFeedback(this.selectedRating, textValue);
                this.hideFeedbackForm();
            };
        }

        if (emojiContainer) {
            emojiContainer.addEventListener('click', (event: Event) => {
                const target = event.target as HTMLElement;
                if (target.dataset.value) {
                    this.selectedRating = parseInt(target.dataset.value, 10);
                    // Highlight the selected emoji
                    Array.from(emojiContainer.children).forEach(child => {
                        (child as HTMLElement).style.filter = 'none';
                    });
                    target.style.filter = 'drop-shadow(0 0 5px #1a73e8)';
                }
            });
        }
    }

    public showFeedbackForm(): void {
        console.log('Feedback UI : Will display feedback form');
        const feedbackForm = document.getElementById('feedbackFormContainer');
        if (feedbackForm) {
            console.log('Feedback UI : Feedback Form Found');
            feedbackForm.style.display = 'block';
        }
    }

    public hideFeedbackForm(): void {
        const feedbackForm = document.getElementById('feedbackFormContainer');
        if (feedbackForm) {
            feedbackForm.style.display = 'none';
        }
        // Reset rating and text if you want a clean state next time
        this.selectedRating = null;
        const feedbackText = document.getElementById('feedbackText') as HTMLTextAreaElement;
        if (feedbackText) feedbackText.value = '';
    }

    private submitFeedback(rating: number | null, feedbackText: string) {
        console.log('Submitted Feedback:', { rating, feedbackText });

        // TODO: Implement logic to send feedback to your database
        // This might involve calling some API endpoint with `rating` and `feedbackText`.
    }
}
