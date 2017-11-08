// Example express application adding the parse-server module to expose Parse
// compatible API routes.
//
'use strict';

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const Utils = require('./cloud/helpers/Utils.js');

const app = express();

// Load configuration files from config directory
const parseServerOptions = require('./config/parse-server.js');
const parseDashboardOptions = require('./config/parse-dashboard.js');

Utils.consoleLog('Server Config', parseServerOptions);
Utils.consoleLog('Dashboard Config', parseDashboardOptions);

// Parse API
const mountPath = process.env.PARSE_MOUNT || '/cloud';
const api = new ParseServer(parseServerOptions);
app.use(mountPath, api);

// Parse dashboard
const dashboard = new ParseDashboard(parseDashboardOptions, parseDashboardOptions.allowInsecureHTTP);
app.use(parseDashboardOptions.mountPath, dashboard);

// Non-Parse web routes
app.get('/', function(req, res) {
  res.status(200).send('Oops! This is not the web page you are looking for.');
});

// var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

// if (!databaseUri) {
//   console.log('DATABASE_URI not specified, falling back to localhost.');
// }

// var api = new ParseServer({
//   databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
//   cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
//   appId: process.env.APP_ID || 'myAppId',
//   masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
//   serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
//   liveQuery: {
//     classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
//   }
// });
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

//Live query server for realtime Parse queries
if (process.env.PARSE_SERVER_ENABLED_LIVE_QUERY == 1) {
  ParseServer.createLiveQueryServer(httpServer);
}

// ['SIGINT', 'SIGTERM'].forEach((sig) => {
//   process.on(sig, function() {
//     console.log(`Gracefully shutting down server after ${sig}...`);
//     httpServer.close();
//     process.exit();
//   });
// });

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
