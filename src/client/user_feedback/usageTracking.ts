export class UsageTrackingManager {
    static totalUsesKey = 'totalUses';
    static lastFeedbackTimeKey = 'lastFeedbackTime';
    static lastFeedbackGivenKey = 'lastFeedbackGiven';
    static usesSinceLastFeedbackKey = 'usesSinceLastFeedback';
    static recommendationsAcceptedKey = 'recommendationsAccepted';
    static recommendationsDiscardedKey = 'recommendationsDiscarded';

    static getFeedbackData() {
        return {
            totalUses: localStorage.getItem(UsageTrackingManager.totalUsesKey),
            lastFeedbackTime: localStorage.getItem(UsageTrackingManager.lastFeedbackTimeKey),
            lastFeedbackGiven: localStorage.getItem(UsageTrackingManager.lastFeedbackGivenKey),
            usesSinceLastFeedback: localStorage.getItem(UsageTrackingManager.usesSinceLastFeedbackKey),
            recommendationsAccepted: localStorage.getItem(UsageTrackingManager.recommendationsAcceptedKey),
            recommendationsDiscarded: localStorage.getItem(UsageTrackingManager.recommendationsDiscardedKey)
        };
    }

    static resetFeedbackData() {
        localStorage.removeItem(UsageTrackingManager.totalUsesKey);
        localStorage.removeItem(UsageTrackingManager.lastFeedbackTimeKey);
        localStorage.removeItem(UsageTrackingManager.lastFeedbackGivenKey);
        localStorage.removeItem(UsageTrackingManager.usesSinceLastFeedbackKey);
        localStorage.removeItem(UsageTrackingManager.recommendationsAcceptedKey);
        localStorage.removeItem(UsageTrackingManager.recommendationsDiscardedKey);
    }

    // This method should be called when the user clicks on Accept/Discard Button
    static incrementUsage(recommendationAccepted: boolean) {
        let totalUses = parseInt(localStorage.getItem(UsageTrackingManager.totalUsesKey) || '0');
        totalUses++;
        localStorage.setItem(UsageTrackingManager.totalUsesKey, totalUses.toString());

        let usesSinceLastFeedback = parseInt(localStorage.getItem(UsageTrackingManager.usesSinceLastFeedbackKey) || '0');
        usesSinceLastFeedback++;
        localStorage.setItem(UsageTrackingManager.usesSinceLastFeedbackKey, usesSinceLastFeedback.toString());

        if(recommendationAccepted) {
            let recommendationsAccepted = parseInt(localStorage.getItem(UsageTrackingManager.recommendationsAcceptedKey) || '0');
            recommendationsAccepted++;
            localStorage.setItem(UsageTrackingManager.recommendationsAcceptedKey, recommendationsAccepted.toString());
        } else {
            let recommendationsDiscarded = parseInt(localStorage.getItem(UsageTrackingManager.recommendationsDiscardedKey) || '0');
            recommendationsDiscarded++;
            localStorage.setItem(UsageTrackingManager.recommendationsDiscardedKey, recommendationsDiscarded.toString());
        }
        
        console.log('Incremented usage');
        console.log('Total Uses: ' + totalUses);
        console.log('Uses Since Last Feedback: ' + usesSinceLastFeedback);
    }

    static shouldShowFeedbackPopup(): boolean {
        const lastFeedbackGiven = localStorage.getItem(UsageTrackingManager.lastFeedbackGivenKey || 'false');
        const usesSinceLastFeedback = parseInt(localStorage.getItem(UsageTrackingManager.usesSinceLastFeedbackKey) || '0');
        if (localStorage.getItem(UsageTrackingManager.lastFeedbackGivenKey) === null) {
            localStorage.setItem(UsageTrackingManager.lastFeedbackGivenKey, 'false');
        }
        if (lastFeedbackGiven === 'true') {
            // User has already given feedback
            let returnVal = usesSinceLastFeedback >= 5;
            if (returnVal) {
                localStorage.setItem(UsageTrackingManager.usesSinceLastFeedbackKey, '0');
            }
            return returnVal;
        } else if (lastFeedbackGiven === 'false') {
            // User has not given feedback
            let returnVal = usesSinceLastFeedback >= 3;
            if (returnVal) {
                localStorage.setItem(UsageTrackingManager.usesSinceLastFeedbackKey, '0');
            }
            return returnVal;
        } else {
            return false;
        }
    }
    
}