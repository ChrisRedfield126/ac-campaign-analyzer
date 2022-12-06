# Adobe Campaign Classic Database Design Analyser

![Example Capture](Screenshot%202020-09-12%20at%2022.54.18.png)

The below demo video runs on a earlier version of the UI. Please check documentation for the latest features
<a href="https://www.youtube.com/watch?v=q4B48dKHl_s" rel="Quick Demo">![Quick Demo](Screenshot%202020-09-12%20at%2023.51.24.png)</a>

# IMPORTANT NOTICE 
All content here is not supported by Adobe as a product feature. This is all pure custom code. Using it, running it is under you responsibility. Please take tare of our Customers Campaign instances

## DATABASE ANALYZER USER DOCUMENTATION AVAILABLE HERE :
https://acrobat.adobe.com/link/track?uri=urn:aaid:scds:US:9c8ce972-e57f-4749-bb73-d28f2f450c28

## Installation : 
1. Download the archive : [ACC_Diagram_Analyzer_Compiled_ReadyToDeploy.zip](ACC_Diagram_Analyzer_Compiled_ReadyToDeploy.zip)
  You will find 2 folders dbajssp and dbanalyser
2. Connect to your Campaign application server as neolane
3. Copy the content of folder dbajssp (2 JSSP files) in /usr/local/neolane/nl6/datakit/xtk/eng/jssp/
4. Create a folder "dbanalyser" in /usr/local/neolane/nl6/web/
    mkdir /usr/local/neolane/nl6/web/dbanalyser
5. Copy the content of folder dbanalyser (the React UI files) in /usr/local/neolane/nl6/web/dbanalyser
6. Open your web Browser (Safari works best but Chrome is ok) and go to http(s)://<yourCampaignServerURL>/nl/dbanalyser/index.html?jsspns=xtk&columnsdepth=10&maxtoload=10&preset=custom&loglevel=0&analyzedepth=30&nocache=false
7. Log in with your admin account (Adobe Campaign credentials) and press "Sign In"

If you see the tables popping up then you are done!
**** **********************************************************************************

NOW IF YOU WANT TO PLAY WITH THE SOURCE CODE THEN PLEASE FIND BELOW HOW TO INSTALL IT ON YOUR ENVIRONMENT

## INSTALLATION

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
