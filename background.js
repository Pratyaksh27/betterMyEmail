console.log('background.js - Script Loaded');
try {
    console.log('background.js - Adding Listener');
    chrome.action.onClicked.addListener((tab) => {
        console.log('background.js -  Inside chrome.action.onClicked');
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['dist/emailToneCheckPlugin.js']
        });
    });
} catch (error) {
    console.error('Error: background.js- ', error);
}