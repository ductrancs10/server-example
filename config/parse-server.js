'use strict';

const _ = require('lodash');
const S3Adapter = require('parse-server').S3Adapter;

const databaseUri = process.env.PARSE_SERVER_DATABASE_URI;

if (!databaseUri) {
  console.log('PARSE_SERVER_DATABASE_URI not specified.');
  process.exit();
}

/* eslint-disable */

let parseServerOptions = {
  databaseURI:    databaseUri,
  cloud:          process.env.PARSE_SERVER_CLOUD_CODE_MAIN || './cloud/main.js',
  appName:        process.env.PARSE_SERVER_APP_NAME || 'Traveling',
  appId:          process.env.PARSE_SERVER_APP_ID || 'MyAppId',
  masterKey:      process.env.PARSE_SERVER_MASTER_KEY || 'MyMasterKey', // Add your master key here. Keep it secret!
  serverURL:      process.env.PARSE_SERVER_URL || 'http://localhost:1337/cloud', // Public URL to your server http://
  publicServerURL:process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/cloud', // Public URL to your server https://
  restAPIKey:     process.env.PARSE_SERVER_REST_API_KEY || 'MyRestApiKey',
  clientKey:      process.env.PARSE_SERVER_CLIENT_KEY || 'MyClientKey', //  Key for iOS, MacOS, tvOS clients
  javascriptKey:  process.env.PARSE_SERVER_JAVASCRIPT_KEY || 'MyJavascriptKey', // Key for the Javascript SDK
  maxUploadSize:  process.env.PARSE_SERVER_MAX_UPLOAD_SIZE || '10mb',
  sessionLength:  process.env.PARSE_SERVER_SESSION_LENGTH || 2592000, // Defaults to 31536000 seconds (1 year)
  allowClientClassCreation: process.env.PARSE_SERVER_ALLOW_CLIENT_CLASS_CREATION || false,
  cluster: process.env.PARSE_SERVER_CLUSTER || false // Run with cluster, optionally set the number of processes default to os.cpus().length
};

const enabledEmailAdapter = process.env.PARSE_SERVER_ENABLED_EMAIL_ADAPTER || 0;

if (enabledEmailAdapter == 1) {
  parseServerOptions = _.extend(parseServerOptions, {
    emailVerifyTokenValidityDuration: process.env.PARSE_SERVER_EMAIL_VERIFY_TOKEN_DURATION || (2 * 60 * 60), // in seconds (2 hours = 7200 seconds)
    preventLoginWithUnverifiedEmail: process.env.PARSE_SERVER_PREVENT_LOGIN_UNVERIFIED_EMAIL || false, // defaults to false
    emailAdapter: {
      module: 'simple-parse-smtp-adapter',
      options: {
        fromAddress: process.env.PARSE_SERVER_EMAIL_ADAPTER_FROM_ADDRESS,
        user: process.env.PARSE_SERVER_EMAIL_ADAPTER_EMAIL,
        password: process.env.PARSE_SERVER_EMAIL_ADAPTER_PASSWORD,
        host: process.env.PARSE_SERVER_EMAIL_ADAPTER_HOST,
        isSSL: true, // True or false if you are using ssl
        port: process.env.PARSE_SERVER_EMAIL_ADAPTER_PORT, // SSL port or another port
        name: process.env.PARSE_SERVER_EMAIL_ADAPTER_NAME_SYSTEM || 'TravelSystem',
        emailField: process.env.PARSE_SERVER_EMAIL_ADAPTER_FIELD_NAME || 'email',
        templates: {
          resetPassword: {
            template: __dirname + '/../views/template/',
            subject: 'Traveling Email'
          }
        }
      }
    },
    passwordPolicy: {
      validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/
    },
    customPages: {
      parseFrameURL: (process.env.PARSE_SERVER_DOMAIN_NAME || '') + '/reset-password',
      invalidLink: (process.env.PARSE_SERVER_DOMAIN_NAME || '') + '/invalid-link',
      passwordResetSuccess: (process.env.PARSE_SERVER_DOMAIN_NAME || '') + '/password-reset-success',
      choosePassword: (process.env.PARSE_SERVER_DOMAIN_NAME || '') + '/reset-password'
    }
  });
}

// LIVE QUERY
const liveQueryClasesStr = process.env.PARSE_SERVER_LIVE_QUERY_CLASS_NAMES;
const liveQueryOptions = {
  liveQuery: {
    classNames: (liveQueryClasesStr ? liveQueryClasesStr.split(',') : '') || ['Post'] // List of classes to support for query subscriptions
  }
};

const enabledLiveQuery = process.env.PARSE_SERVER_ENABLED_LIVE_QUERY || 0;

if (enabledLiveQuery == 1) {
  parseServerOptions = _.extend(parseServerOptions, liveQueryOptions);
}

// // Setup FilesAdapter
const enabledS3Adapter = process.env.PARSE_SERVER_ENABLED_S3_ADAPTER || 0;

if (enabledS3Adapter == 1) {
  parseServerOptions = _.extend(parseServerOptions, {
    filesAdapter: new S3Adapter(
      process.env.PARSE_SERVER_S3_ACCESS_KEY || '',
      process.env.PARSE_SERVER_S3_SECRET_KEY || '',
      process.env.PARSE_SERVER_S3_BUCKET || '',
      {
        bucketPrefix: process.env.PARSE_SERVER_S3_BUCKET_PREFIX || '',
        region:       process.env.PARSE_SERVER_S3_REGION || 'ap-northeast-1', // Tokyo
        directAccess: process.env.PARSE_SERVER_S3_DIRECT_ACCESS || true
      }
    )
  });
} else {
  parseServerOptions = _.extend(parseServerOptions, {
    fileKey: process.env.PARSE_SERVER_FILE_KEY || 'MyFileKey'
  });
}

// PUSH NOTIFICATION
const pushConfig = {
  push: {
    ios: [{
      pfx:        process.env.PARSE_SERVER_PUSH_IOS_PFX_PATH_DEV, // Dev PFX or P12
      bundleId:   process.env.PARSE_SERVER_PUSH_IOS_BUNDLE_ID_DEV,
      topic:      process.env.PARSE_SERVER_PUSH_IOS_BUNDLE_ID_DEV,
      passphrase: process.env.PARSE_SERVER_PUSH_IOS_PASSPHRASE_DEV, // optional password to your p12/PFX
      production: false // Dev
    }, {
      pfx:        process.env.PARSE_SERVER_PUSH_IOS_PFX_PATH, // Dev PFX or P12
      bundleId:   process.env.PARSE_SERVER_PUSH_IOS_BUNDLE_ID,
      topic:      process.env.PARSE_SERVER_PUSH_IOS_BUNDLE_ID,
      passphrase: process.env.PARSE_SERVER_PUSH_IOS_PASSPHRASE, // optional password to your p12/PFX
      production: true // Prod
    }],
    android: {
      senderId: process.env.PARSE_SERVER_PUSH_ANDROID_SENDER_ID,
      apiKey: process.env.PARSE_SERVER_PUSH_ANDROID_API_KEY
    }
  }
};

const enabledPushNotification = process.env.PARSE_SERVER_ENABLED_PUSH || 0;

if (enabledPushNotification == 1) {
  parseServerOptions = _.extend(parseServerOptions, pushConfig);
}

// Auth providers
const AuthConfig = {
  auth: {
    facebook: {
      appIds:           process.env.PARSE_SERVER_FACEBOOK_APP_ID
    },
    twitter: {
      consumer_key:     process.env.PARSE_SERVER_TWITTER_CONSUMER_KEY,
      consumer_secret:  process.env.PARSE_SERVER_TWITTER_CONSUMER_SECRET
    },
    line: {
      module: 'line-login'
    },
    instagram: {}
  }
};

const enabledFBOAuth = process.env.PARSE_SERVER_ENABLED_FACEBOOK_OAUTH || 0;

if (enabledFBOAuth == 0) {
  delete AuthConfig.auth.facebook;
}

const enabledTWOAuth = process.env.PARSE_SERVER_ENABLED_TWITTER_OAUTH || 0;

if (enabledTWOAuth == 0) {
  delete AuthConfig.auth.twitter;
}

const enabledITOAuth = process.env.PARSE_SERVER_ENABLED_INSTAGRAM_OAUTH || 0;

if (enabledITOAuth == 0) {
  delete AuthConfig.auth.instagram;
}

parseServerOptions = _.extend(parseServerOptions, AuthConfig);

// Diabled verbos, only show errors
if (process.env.PARSE_SERVER_VERBOSE_OVERRIDE == 1) {
  parseServerOptions.verbose = false;
  const logLevel = (process.env.PARSE_SERVER_LOG_LEVEL_OVERRIDE) ? process.env.PARSE_SERVER_LOG_LEVEL_OVERRIDE : 'error';
  parseServerOptions.logLevel = logLevel; // 'info', 'error', 'warn', 'verbose', 'debug', 'silly'
}

module.exports = parseServerOptions;
