const request = require('request');
require('dotenv').config();

let getTokenOptions = {
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/oauth/token`,
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  form: {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    audience: process.env.AUDIENCE,
    grant_type: 'client_credentials'
  }
}

let createUserOptions = {
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/api/v2/users`,
  headers: {
    'content-type': 'application/json',
    'Authorization': 'Bearer {applicationToken}'
  },
  body: JSON.stringify({
    "email": "byaliy03+1@gmail.com",
    "user_metadata": {},
    "blocked": false,
    "email_verified": false,
    "app_metadata": {},
    "given_name": "Dan",
    "family_name": "Byaliy",
    "name": "Dan Byaliy",
    "nickname": "Dan03",
    "picture": "https://scontent-iev1-1.cdninstagram.com/v/t51.2885-19/279357830_819603112333045_6082864716320326450_n.jpg?stp=dst-jpg_s320x320&_nc_ht=scontent-iev1-1.cdninstagram.com&_nc_cat=101&_nc_ohc=WcYGkzh6G2kAX95Hf4o&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfCywlsDfdkPRWH1xgtIBtljsix--5mWSIxeMsY5trp1hw&oe=655F699A&_nc_sid=8b3546",
    "user_id": "abcd",
    "connection": "Username-Password-Authentication",
    "password": "Google1234",
    "verify_email": false
  })
}

let createRoleOptions = {
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/api/v2/roles`,
  headers: {
    'Authorization': 'Bearer {applicationToken}',
    'content-type': 'application/x-www-form-urlencoded'},
  form: {
    name: 'Some Role',
    description: 'just new some role for test'
  }
}

const userId = 'auth0|abcd';
const roleId = 'rol_d2DSrr3bcEzfjOW5';

let applyRolesToUserOptions = {
  method: 'POST',
  url: `https://${procces.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
  headers: {
    'Authorization': 'Bearer {applicationToken}',
    'content-type': 'application/x-www-form-urlencoded'},
  form: {
    roles: [roleId]
  }
}

// getTokenOptions, createUserOptions, createRoleOptions, applyRolesToUserOptions
request(options, (error, _, body) => {
  if (error) throw new Error(error);
  console.log(body);
})
