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

    function sendButtonClickHandler(event: Event) {
        console.log('emailToneCheckPlugin.ts: Inside sendButtonClickHandler');
        event.preventDefault();
        event.stopImmediatePropagation();
        const mouseEvent = event as MouseEvent;
        mouseEvent.preventDefault();
        mouseEvent.stopImmediatePropagation();
        //alert('emailToneCheckPlugin.ts: User clicked on Send Button');
        //fetchAndHandleToneCheck(event);
 
        const confirmToneCheck = window.confirm('Do you want to tone check the email?');

        if (confirmToneCheck) {
            console.log('emailToneCheckPlugin.ts: User wants to tone check the email');
            fetchAndHandleToneCheck(event);
        } else {
            console.log('emailToneCheckPlugin.ts: User does NOT want to tone check the email');
        }
     }

    function fetchAndHandleToneCheck(event: Event) {
        console.log('emailToneCheckPlugin.ts: Inside fetchAndHandleToneCheck');
        const emailContentElement = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
        const emailContent = emailContentElement ? emailContentElement.textContent : '';
        console.log('emailToneCheckPlugin.ts fetchAndHandleToneCheck() Email Content: ', emailContent);
        fetch('http://localhost:3000/analyzeTone', {
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
    } 

    function addSendButtonClickHandler() {
        const sendButton = document.querySelector('[role="button"][aria-label*="Send"], [role="button"][data-tooltip*="Send"]');
        if (sendButton && !sendButtonProcessed) {
            //console.log('emailToneCheckPlugin.js: Send Button Found');
            //sendButton.removeEventListener('click', sendButtonClickHandler);
            //sendButton.removeAttribute('click');
            sendButton.addEventListener('click', sendButtonClickHandler, { once: true });
            sendButtonProcessed = true;
            //observer.disconnect();
        } else {
            //console.log('emailToneCheckPlugin.js: Send Button NOT Found. Will check again.');
            setTimeout(addSendButtonClickHandler, 1000);  // Retry after 1 second
        }
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                // console.log('emailToneCheckPlugin.js: Mutation observed - checking for Send button');
                addSendButtonClickHandler();
                
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function restartObserver(){
        observer.observe(document.body, { childList: true, subtree: true });
        addSendButtonClickHandler();
    }

    addSendButtonClickHandler();
})();

