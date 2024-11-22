export class FeedbackManager {
    static totalUses = '0';
    static lastFeedbackTime = 'null';
    static lastFeedbackGiven = 'false';
    static usesSinceLastFeedback = '0';

    static getFeedbackData() {
        return {
            totalUses: localStorage.getItem(FeedbackManager.totalUses),
            lastFeedbackTime: localStorage.getItem(FeedbackManager.lastFeedbackTime),
            lastFeedbackGiven: localStorage.getItem(FeedbackManager.lastFeedbackGiven),
            usesSinceLastFeedback: localStorage.getItem(FeedbackManager.usesSinceLastFeedback)
        };
    }

    static resetFeedbackData() {
        localStorage.removeItem(FeedbackManager.totalUses);
        localStorage.removeItem(FeedbackManager.lastFeedbackTime);
        localStorage.removeItem(FeedbackManager.lastFeedbackGiven);
        localStorage.removeItem(FeedbackManager.usesSinceLastFeedback);
    }

    // This method should be called when the user clicks on Accept/Discard Button
    static incrementUsage() {
        let totalUses = parseInt(localStorage.getItem(FeedbackManager.totalUses) || '0');
        totalUses++;
        localStorage.setItem(FeedbackManager.totalUses, totalUses.toString());

        let usesSinceLastFeedback = parseInt(localStorage.getItem(FeedbackManager.usesSinceLastFeedback) || '0');
        usesSinceLastFeedback++;
        localStorage.setItem(FeedbackManager.usesSinceLastFeedback, usesSinceLastFeedback.toString());
    }

    static shouldShowFeedbackPopup(): boolean {
        const lastFeedbackGiven = localStorage.getItem(FeedbackManager.lastFeedbackGiven);
        const usesSinceLastFeedback = parseInt(localStorage.getItem(FeedbackManager.usesSinceLastFeedback) || '0');

        if (lastFeedbackGiven === null || lastFeedbackGiven === 'null') {
            // First time user
            return true;
        } else if (lastFeedbackGiven === 'true') {
            // User has already given feedback
            let returnVal = usesSinceLastFeedback >= 5;
            if (returnVal) {
                localStorage.setItem(FeedbackManager.usesSinceLastFeedback, '0');
            }
            return returnVal;
        } else {
            // User has not given feedback
            let returnVal = usesSinceLastFeedback >= 3;
            if (returnVal) {
                localStorage.setItem(FeedbackManager.usesSinceLastFeedback, '0');
            }
            return returnVal;
        }
    }
    
}