//import { send } from "process";

/*
End User can evaluate an email they’ve written to “Better my email” before sending. 
The Plugin will “evaluate” the email and give personalized recommendations. 
Users can Accept/Discard the suggestion

USer Clicks on Send Button. He is taken to a Plugin asking if he wishes to Better their email.
*/
console.log('betterMyEmailPlugin.js - Start');

(function() {
    console.log('Script executing immediately after load');
    let sendButtonProcessed = false;

    function getConfigs(): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['config'], function(result: any) {
                if (result.config) {
                    console.log('betterMyEmailPlugin.ts: getConfigs() Configs found: ', result.config);
                    resolve(result.config);
                } else {
                    console.log('betterMyEmailPlugin.ts: getConfigs() Configs NOT found');
                    reject(new Error('Configs not found'));
                }
            });
        });
    }
    async function fetchBetterMyEmailAPI(event: Event) {
        console.log('betterMyEmailPlugin.ts: Inside fetchBetterMyEmailAPI');
        const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
        const emailContent = emailContentElement ? emailContentElement.textContent : '';
        console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Email Content: ', emailContent);
        try {
            const configs = await getConfigs();
            console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs: ', configs);
            if (configs && configs.analysis_URL) {
                console.log('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() API Gateway URL: ', configs.analysis_URL);
                await fetch(`${configs.analysis_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ emailContent: emailContent })
                })
                .then(response => {
                    console.log('betterMyEmailPlugin.ts: Printing Better my Email Analysis Response: ');
                    console.log('betterMyEmailPlugin.ts: Better my Email Analysis Response: ', response);
                    return response.json()
                })
                .then(data => {
                    if (!data) {
                        console.error('betterMyEmailPlugin.ts Error: Data received from Better my Email Analysis');
                        return;
                    } else if (!data.analysisResult) {
                        console.error('betterMyEmailPlugin.ts Error: Data does not have a analysisResult property');
                        return;
                    }
                    console.log('Received Data', data);
                    console.log('betterMyEmailPlugin.ts: Better my Email Analysis Result: ', data.analysisResult);
                    //Display the Better my Email Analysis result to the user
                    /*const betterMyEmailResult = window.confirm(`Better my Email Analysis Result:\n\n${data.analysisResult}`);
                    if (betterMyEmailResult) {
                        console.log('betterMyEmailPlugin.ts: User accepted the Better my Email Analysis result');
                    } else {
                        console.log('betterMyEmailPlugin.ts: User discarded the Better my Email Analysis result');
                    }*/
                    showBetterMyEmailResultDialog(data);
                })
                .catch(error => {
                    console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
                });
                
            } else {
                console.error('betterMyEmailPlugin.ts fetchBetterMyEmailAPI() Configs not found');
            }
        
            
            } catch (error) {
                console.error('betterMyEmailPlugin.ts: Error in Better my Email Analysis: ', error);
            }
    } 

    function addBetterMyEmailButton(){
        const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
        if (sendButton && sendButton.parentNode) {
            if (!sendButton.nextSibling || sendButton.nextSibling.textContent !== 'Better My Email') {
                const betterMyEmailButton = document.createElement('button');
                betterMyEmailButton.textContent = 'Better My Email';
                betterMyEmailButton.style.cssText = 'background-color: #1a73e8; color: white; padding: 5px 5px; cursor: pointer; display: inline-block; margin-left: 0px;';
                betterMyEmailButton.onclick = fetchBetterMyEmailAPI;
                sendButton.parentNode.insertBefore(betterMyEmailButton, sendButton.nextSibling);

            }
            console.log('betterMyEmailPlugin.js: Send Button Found');
        } else {
            //console.log('betterMyEmailPlugin.js: Send Button NOT Found. Will check again.');
            setTimeout(addBetterMyEmailButton, 1000);  // Retry after 1 second
        }
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                // console.log('betterMyEmailPlugin.js: Mutation observed - checking for Send button');
                //addSendButtonClickHandler();
                addBetterMyEmailButton();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function restartObserver(){
        observer.observe(document.body, { childList: true, subtree: true });
        addBetterMyEmailButton();
    }

    addBetterMyEmailButton();

    // Inject the dialog HTML into the DOM
    const dialogHTML = `
        <dialog id="betterMyEmailDialog" style="width: 750px !important;">
            <form method="dialog">
                <h1>Better My Email Result:</h1>
                <p id="betterMyEmailDialogContent"></p>
                <menu>
                    <button value="default">Okay</button>
                </menu>
            </form>
    `;
    document.body.insertAdjacentHTML('beforeend', dialogHTML);

    function showBetterMyEmailResultDialog(data:any) {
        const dialog = document.getElementById('betterMyEmailDialog') as HTMLDialogElement;
        const content = document.getElementById('betterMyEmailDialogContent');
        if (!dialog || !content) {
            console.error('betterMyEmailPlugin.ts: Dialog element not found');
            return;
        }
        //content.textContent = data.analysisResult;
        const formattedData = data.analysisResult.replace(/\n/g, '<br>');
        content.innerHTML = formattedData;
        dialog.showModal();

        dialog.addEventListener('close', function() {
            console.log('betterMyEmailPlugin.ts: Dialog closed');
        });
    }


})();

