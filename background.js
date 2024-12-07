console.log('background.js - Script Loaded');
try {
    console.log('background.js - Adding Listener');
    chrome.action.onClicked.addListener((tab) => {
        console.log('background.js - Inside chrome.action.onClicked');
    });
} catch (error) {
    console.error('Error: background.js- ', error);
}

// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('background.js - Extension installed or updated');
    // Get all active tabs and re-inject the content script
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            if (tab.id) {
                if(tab.url && tab.url.includes('mail.google.com')) {
                    console.log('background.js - Injecting Script after Updates/Installation: ', tab.url);
                    chrome.tabs.reload(tab.id);
                } else {
                    console.log('background.js - Not injecting Script. Tab is not Gmail: ', tab.url);
                }
            }
        }
    });
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