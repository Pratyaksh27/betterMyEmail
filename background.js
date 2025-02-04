console.log('background.js - Script Loaded');

// Combined onInstalled listener (only one allowed)
chrome.runtime.onInstalled.addListener((details) => {
    console.log('background.js - Extension installed or updated. Reason:', details.reason);

    // 1. Handle email capture for install/update
    if (details.reason === 'install' || details.reason === 'update') {
        captureEmail();
    }

    // 2. Existing tab reload logic
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            if (tab.id && tab.url?.includes('mail.google.com')) {
                console.log('background.js - Reloading Gmail tab:', tab.url);
                chrome.tabs.reload(tab.id);
            }
        }
    });
});

// Existing action click handler (keep this)
try {
    chrome.action.onClicked.addListener((tab) => {
        console.log('background.js - Action button clicked');
    });
} catch (error) {
    console.error('Error in action click handler:', error);
}

// Existing uninstall URL setup (keep this)
const uninstallFeedbackUrl = 'https://forms.gle/UtaPV6jiRMN9kiZv8';
try {
    chrome.runtime.setUninstallURL(uninstallFeedbackUrl);
} catch (error) {
    console.error('Error setting uninstall URL:', error);
}

// Email capture functions (modified for reliability)
async function captureEmail() {
    try {
        const { storedEmail } = await chrome.storage.local.get('storedEmail');
        if (storedEmail) {
            console.log('Email already stored:', storedEmail);
            return;
        }

        // Attempt silent auth first
        let token;
        try {
            token = await chrome.identity.getAuthToken({ interactive: false });
            console.log('Silent auth success');
        } catch (silentError) {
            console.log('Silent auth failed, trying interactive');
            token = await chrome.identity.getAuthToken({ interactive: true });
        }

        const email = await fetchEmail(token.token);
        await chrome.storage.local.set({ storedEmail: email });
        console.log('Email captured:', email);
        
    } catch (error) {
        console.error('Email capture failed:', error);
    }
}

async function fetchEmail(token) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { email } = await response.json();
    return email;
}

// Periodic email check (once daily)
chrome.alarms.create('emailRefresh', { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'emailRefresh') {
        console.log('Running daily email check');
        captureEmail();
    }
});

let config = {};
let configUrl = chrome.runtime.getURL('config.json');
fetch(configUrl)
    .then(response => response.json())
    .then(data => {
        config = data;
        chrome.storage.sync.set({config: config}, () => {
            // console.log('background.js - Config is set to ', config);
        });
    }).catch(
    error => {
        console.error('background.js: Error Loading configuration- ', error);
    }
    );


