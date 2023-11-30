const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
    audience: process.env.AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

const SESSION_KEY = 'Authorization';

const loginUser = async (login, password) => {
    return fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'password',
            username: login,
            password: password,
            audience: `${process.env.AUDIENCE}`,
            client_id: `${process.env.CLIENT_ID}`,
            client_secret:`${process.env.CLIENT_SECRET}`,
            scope: 'openid offline_access',
        })
    })
}

const createUser = async (applicationToken, email, password) => {
    return fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: { 
            'content-type': 'application/json',
            'Authorization': `Bearer ${applicationToken}`
        },
        body: JSON.stringify({
            email,
            password,
            connection: 'Username-Password-Authentication'
        })
    })
}

const getApplicationToken = async () => {
    return fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: `${process.env.CLIENT_ID}`,
            client_secret: `${process.env.CLIENT_SECRET}`,
            audience: `${process.env.AUDIENCE}`,
            grant_type: 'client_credentials'
        })
    })
}

const refreshUserToken = async (refresh_token) => {
    return fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token,
            client_id: `${process.env.CLIENT_ID}`,
            client_secret: `${process.env.CLIENT_SECRET}`,
        })
    })
}

app.get('/', (req, res) => {
    const token = req.get(SESSION_KEY);

    if (token) {
        try {
            const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            if ((decodedToken.exp * 1000) < Date.now()) return res.status(401).send('token expired');
            
            return res.json({
                username: decodedToken.nickname,
                logout: 'http://localhost:3000/logout'
            });
        } catch (error) {
            console.error(error);
            return res.status(401).send('invalid token');
        }
    }

    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (_, res) => {
    res.redirect('/');
});


app.get('/private', checkJwt, (_, res) => {
    return res.json({
        privateData: new Date().toISOString()
    });
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    const response = await loginUser(login, password);
    if (response.ok) {
        const { access_token, refresh_token, id_token } = await response.json();
        console.log('Refresh_token:     ', refresh_token);

        if (access_token) {
            return res.json({ access_token, refresh_token, id_token });
        }
    }
    res.status(401).send();
});

app.post('/api/signup', async (req, res) => {
    const { login, password } = req.body;

    const response = await getApplicationToken();
    const { access_token } = await response.json();
    if (!access_token) return res.status(401).send();

    const response2 = await createUser(access_token, login, password);
    const { message, error, statusCode } = await response2.json();
    if (error && message) return res.status(statusCode).send(message);

    return res.send('User was created successfully');
});


app.post('/api/refreshToken', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) return res.status(401).send();
    const response = await refreshUserToken(refresh_token);

    const { access_token, id_token } = await response.json();
    if (!access_token) return res.status(401).send();

    return res.json({ access_token, id_token });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
