# Better My Email

## Overview
Better My Email is a Chrome Extension designed to improve your email composition by providing tone and content suggestions. This README provides detailed instructions on how to install, test, and deploy the extension, as well as rollback procedures for the server and client.

## 1. Rollbacks

### Server Rollback (Heroku)
List all releases:
```bash
heroku releases
```
Rollback to a specific version:
```bash
heroku rollback vXX
```
Replace `vXX` with the version number you want to revert to.

### Client Rollback
Use git to revert to a specific commit:
```bash
git checkout <commit-hash>
```
Rebuild and re-zip the extension:
```bash
npm run build
zip -r BetterMyEmail_vX.X.zip manifest.json background.js config.json dist/client/* icons popup.html popup.js popup.png appu.jpg tsconfig.client.json webpack.config.cjs
```
Re-upload to the Chrome Web Store.

OR

[Go to the Chrome Developer Dashboard Console](https://chrome.google.com/webstore/devconsole/95ee1d1b-8f50-43a2-8a0f-a23dc06fc548)

Click on the Better My Email Item. 
Go to "Package" and Click on the button "Roll back to Previous Version"


## 2. Installations

### Prerequisites
- Install Node.js and npm.
- Install Heroku CLI.

### Install Dependencies
Run the following commands to install dependencies:
```bash
npm init -y
npm install --save-dev @types/node
npm install express
npm install --save-dev webpack webpack-cli ts-loader
npm install --save-dev @types/express
npm install --save-dev @types/body-parser @types/axios @types/cors
npm install open
npm install --save-dev @types/chrome
npm install dotenv
```

### Build the Project
To build the project:
```bash
npm run build
```

### Push to GitHub
Push your changes to GitHub:
```bash
git push -u origin branch_name
```

## 3. Heroku

### Push to Heroku
Add your Heroku app as a remote:
```bash
heroku git:remote -a new-email-tone-check-app (Name of the app in Heroku)
```
Push to Heroku:
```bash
git push heroku master
```

### Check Logs
To debug issues, check the logs:
```bash
heroku logs --tail
```

### List all apps on Heroku
To list apps:
```bash
heroku apps
```

## 4. Uploading Extension to the Chrome Web Store

### Build and Prepare for Upload
Run the build process:
```bash
npm run build
```
Create a zip file for the extension:
```bash
cd /path/to/your/extension
zip -r BetterMyEmail_vX.X.zip manifest.json background.js config.json dist/client/* icons popup.html popup.js popup.png appu.jpg tsconfig.client.json webpack.config.cjs
```
### To Upload the zip file to the Chrome Web Store :

[Go to the Chrome Developer Dashboard Console](https://chrome.google.com/webstore/devconsole/95ee1d1b-8f50-43a2-8a0f-a23dc06fc548)

Click on the Better My Email Item. 
Go to "Package" and Click on "Upload New Package" and upload the Zip file

## 5. Running Server Locally and Testing

### Start the Server Locally
Run the server:
```bash
node dist/server/apiGatewayServer.js
```
The server will run on `http://localhost:3000` (default).

### Test the Extension Locally
Modify the Extension Configuration for Local Testing:
Update `config.json` in the extension folder to point to the local server:
```json
{
    "apiBaseUrl": "http://localhost:3000"
}
```
Load the Extension in Chrome:
1. Go to `chrome://extensions/`.
2. Enable Developer mode (top-right corner).
3. Click Load Unpacked and select the root directory of the extension.

Test the Integration:
1. Open Gmail or any supported email client in Chrome.
2. Interact with the extension and confirm it connects to the locally running server.