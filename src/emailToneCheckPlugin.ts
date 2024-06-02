//import { send } from "process";

/*
End User can evaluate an email they’ve written for “tone check” before sending. 
The Plugin will “evaluate” the email and give personalized recommendations. 
Users can Accept/Discard the suggestion

USer Clicks on Send Button. He is taken to a Plugin asking if he wishes to tone check the email.
*/
console.log('emailToneCheckPlugin.js - Start');

(function() {
    console.log('Script executing immediately after load');
    let sendButtonProcessed = false;

    function getConfigs(): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['config'], function(result: any) {
                if (result.config) {
                    console.log('emailToneCheckPlugin.ts: getConfigs() Configs found: ', result.config);
                    resolve(result.config);
                } else {
                    console.log('emailToneCheckPlugin.ts: getConfigs() Configs NOT found');
                    reject(new Error('Configs not found'));
                }
            });
        });
    }

    async function fetchAndHandleToneCheck(event: Event) {
        console.log('emailToneCheckPlugin.ts: Inside fetchAndHandleToneCheck');
        const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
        const emailContent = emailContentElement ? emailContentElement.textContent : '';
        console.log('emailToneCheckPlugin.ts fetchAndHandleToneCheck() Email Content: ', emailContent);
        try {
            const configs = await getConfigs();
            console.log('emailToneCheckPlugin.ts fetchAndHandleToneCheck() Configs: ', configs);
            if (configs && configs.analysis_URL) {
                console.log('emailToneCheckPlugin.ts fetchAndHandleToneCheck() API Gateway URL: ', configs.analysis_URL);
                await fetch(`${configs.analysis_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ emailContent: emailContent })
                })
                .then(response => {
                    console.log('emailToneCheckPlugin.ts: Printing Tone Analysis Response: ');
                    console.log('emailToneCheckPlugin.ts: Tone Analysis Response: ', response);
                    return response.json()
                })
                .then(data => {
                    if (!data) {
                        console.error('emailToneCheckPlugin.ts Error: Data received from tone analysis');
                        return;
                    } else if (!data.tone) {
                        console.error('emailToneCheckPlugin.ts Error: Data does not have a TONE property');
                        return;
                    }
                    console.log('Received Data', data);
                    console.log('emailToneCheckPlugin.ts: Tone Analysis Result: ', data.tone);
                    //Display the tone analysis result to the user
                    const toneAnalysisResult = window.confirm(`Tone Analysis Result:\n\n${data.tone}`);
                    if (toneAnalysisResult) {
                        console.log('emailToneCheckPlugin.ts: User accepted the tone analysis result');
                    } else {
                        console.log('emailToneCheckPlugin.ts: User discarded the tone analysis result');
                    }
                })
                .catch(error => {
                    console.error('emailToneCheckPlugin.ts: Error in tone analysis: ', error);
                });
                
            } else {
                console.error('emailToneCheckPlugin.ts fetchAndHandleToneCheck() Configs not found');
            }
        
            
            } catch (error) {
                console.error('emailToneCheckPlugin.ts: Error in tone analysis: ', error);
            }
    } 

    function addToneCheckButton(){
        const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
        if (sendButton && sendButton.parentNode) {
            if (!sendButton.nextSibling || sendButton.nextSibling.textContent !== 'Tone Check') {
                const toneCheckButton = document.createElement('button');
                toneCheckButton.textContent = 'Tone Check';
                toneCheckButton.style.cssText = 'background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;';
                toneCheckButton.onclick = fetchAndHandleToneCheck;
                sendButton.parentNode.insertBefore(toneCheckButton, sendButton.nextSibling);

            }
            console.log('emailToneCheckPlugin.js: Send Button Found');
        } else {
            //console.log('emailToneCheckPlugin.js: Send Button NOT Found. Will check again.');
            setTimeout(addToneCheckButton, 1000);  // Retry after 1 second
        }
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                // console.log('emailToneCheckPlugin.js: Mutation observed - checking for Send button');
                //addSendButtonClickHandler();
                addToneCheckButton();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function restartObserver(){
        observer.observe(document.body, { childList: true, subtree: true });
        addToneCheckButton();
    }

    addToneCheckButton();
})();

