const request = require('request');
require('dotenv').config();

const getTokensOptions = {
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/oauth/token/`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: {
    grant_type: 'password',
    username: 'byaliy03@gmail.com',
    password: 'Goo4321gle',
    audience: process.env.AUDIENCE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'openid offline_access',
  },
};

var refreshTokenOptions = { 
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/oauth/token`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: { 
    grant_type: 'refresh_token',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: 'refresh_token'
  }
};

const userId = 'auth0|abcd';

var changePasswordOptions = {
  method: 'PATCH',
  url: `https://${procces.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
  headers: {
    'content-type': 'application/json',
    'Authorization': 'Bearer {applicationToken}'
  },
  json: {
    password: 'Goo4321gle',
    connection: 'Username-Password-Authentication',
  }
};

// getTokensOptions, refreshTokenOptions, changePasswordOptions
request(options, function (error, _, body) {
  if (error) throw new Error(error);

  console.log(body);
});
