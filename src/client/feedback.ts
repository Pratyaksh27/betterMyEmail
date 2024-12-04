export class FeedbackManager {
    static totalUsesKey = 'totalUses';
    static lastFeedbackTimeKey = 'lastFeedbackTime';
    static lastFeedbackGivenKey = 'lastFeedbackGiven';
    static usesSinceLastFeedbackKey = 'usesSinceLastFeedback';

    static getFeedbackData() {
        return {
            totalUses: localStorage.getItem(FeedbackManager.totalUsesKey),
            lastFeedbackTime: localStorage.getItem(FeedbackManager.lastFeedbackTimeKey),
            lastFeedbackGiven: localStorage.getItem(FeedbackManager.lastFeedbackGivenKey),
            usesSinceLastFeedback: localStorage.getItem(FeedbackManager.usesSinceLastFeedbackKey)
        };
    }

    static resetFeedbackData() {
        localStorage.removeItem(FeedbackManager.totalUsesKey);
        localStorage.removeItem(FeedbackManager.lastFeedbackTimeKey);
        localStorage.removeItem(FeedbackManager.lastFeedbackGivenKey);
        localStorage.removeItem(FeedbackManager.usesSinceLastFeedbackKey);
    }

    // This method should be called when the user clicks on Accept/Discard Button
    static incrementUsage() {
        let totalUses = parseInt(localStorage.getItem(FeedbackManager.totalUsesKey) || '0');
        totalUses++;
        localStorage.setItem(FeedbackManager.totalUsesKey, totalUses.toString());

        let usesSinceLastFeedback = parseInt(localStorage.getItem(FeedbackManager.usesSinceLastFeedbackKey) || '0');
        usesSinceLastFeedback++;
        localStorage.setItem(FeedbackManager.usesSinceLastFeedbackKey, usesSinceLastFeedback.toString());
        console.log('Incremented usage');
        console.log('Total Uses: ' + totalUses);
        console.log('Uses Since Last Feedback: ' + usesSinceLastFeedback);
    }

    static shouldShowFeedbackPopup(): boolean {
        const lastFeedbackGiven = localStorage.getItem(FeedbackManager.lastFeedbackGivenKey || 'false');
        const usesSinceLastFeedback = parseInt(localStorage.getItem(FeedbackManager.usesSinceLastFeedbackKey) || '0');
        if (localStorage.getItem(FeedbackManager.lastFeedbackGivenKey) === null) {
            localStorage.setItem(FeedbackManager.lastFeedbackGivenKey, 'false');
        }
        if (lastFeedbackGiven === 'true') {
            // User has already given feedback
            let returnVal = usesSinceLastFeedback >= 5;
            if (returnVal) {
                localStorage.setItem(FeedbackManager.usesSinceLastFeedbackKey, '0');
            }
            return returnVal;
        } else if (lastFeedbackGiven === 'false') {
            // User has not given feedback
            let returnVal = usesSinceLastFeedback >= 3;
            if (returnVal) {
                localStorage.setItem(FeedbackManager.usesSinceLastFeedbackKey, '0');
            }
            return returnVal;
        } else {
            return false;
        }
    }
    
}