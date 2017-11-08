'use strict';

const parseServerOptions = require('./parse-server.js');

module.exports = {
  allowInsecureHTTP: true,
  mountPath: process.env.DASHBOARD_MOUNT || '/dashboard',
  trustProxy: 1,
  apps: [
    {
      serverURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/cloud',
      appId: process.env.PARSE_SERVER_APP_ID || 'Qd8P4hyrlMS84fF2GUCk7o4NK7A0lcSp',
      masterKey: process.env.PARSE_SERVER_MASTER_KEY || '9S8s0mVmTOFSsIIW9FCgOhSgalOWSmcz', // Add your master key here. Keep it secret!
      javascriptKey: process.env.PARSE_SERVER_JAVASCRIPT_KEY || '9m4hxvmlGRsqCBFEZo04ZTAuoGiqpvRq', // Key for the Javascript SDK
      restKey: process.env.PARSE_SERVER_REST_API_KEY || 'kuSFO8ybyVRDuumLjsSNnkF35twUVLAG',
      clientKey: process.env.PARSE_SERVER_CLIENT_KEY || 'lMXTAcTwTsfF3JukkJj52CxoUJszwriD', //  Key for iOS, MacOS, tvOS clients
      appName: process.env.PARSE_SERVER_APP_NAME || 'Traveling',
      appNameForURL: 'traveling'
    }
  ],
  users: [
    {
      user: 'traveling_dev',
      pass: '$2y$10$fDESvp0vzblMGP8Tp5G2V.LGpHr3ZymI1Y28OYI3mnzpF2LUwmto6' // travelingdev1234
    },
    {
      user: 'traveling_prod',
      pass: '$2y$10$FpWbK835fF/cQcSMkjgUy.Qm9gpSoRT5n4npJC5BrE8TYxf9eCFG2' // travelingprod1234
    }
  ],
  useEncryptedPasswords: true // @link: https://bcrypt-generator.com
};
