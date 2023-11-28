const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { log } = require('console');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';
const SECRET_KEY = 'jwt';


const generateJWT = (payload) => {
    return jwt.sign(payload, SECRET_KEY, {
        expiresIn: 30
    });
};

const verifyToken = (token) => {
    if (!token) return null;

    try {
        const data = jwt.verify(token, SECRET_KEY);
        const user = users.find(user => user.login == data.login);

        if (!user) return null;
        return user.username;
    } catch(error) {
        console.error("Error: ", error.message);
        return null;
    }
}

app.use((req, res, next) => {
    let sessionId = req.get(SESSION_KEY);
    req.username = verifyToken(sessionId);
    req.sessionId = sessionId;
    next();
});

app.get('/', (req, res) => {
    console.log(req.username);
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        const jwt = generateJWT({ login: user.login });

        return res.json({ token: jwt });
    }

    res.status(401).send({timeToWait: 5000});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

