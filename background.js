console.log('background.js - Script Loaded');
try {
    console.log('background.js - Adding Listener');
    chrome.action.onClicked.addListener((tab) => {
        console.log('background.js -  Inside chrome.action.onClicked');
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['dist/client/betterMyEmailPlugin.js']
        });
    });
} catch (error) {
    console.error('Error: background.js- ', error);
}

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