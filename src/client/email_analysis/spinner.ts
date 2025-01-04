export function getSpinnerHTML() {
    console.log ("Spinner : getSpinnerHTML called");
    return `
        <div id="betterMyEmailSpinner" style="display:none; position: fixed; z-index: 999999; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
            <div style="border: 8px solid #f3f3f3; border-radius: 50%; border-top: 8px solid #3498db; width: 60px; height: 60px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite;"></div>
        </div>

        <style>
            @-webkit-keyframes spin {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
            }

            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
        </style>
    `;
}