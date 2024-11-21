const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const secretKey = 'secret_jwt';
const tokenExpiry = '10m';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const indexHtmlPath = path.join(__dirname, 'index.html');

const users = [
    { login: 'Login', password: 'Password', username: 'Username' },
    { login: 'Daria', password: 'Password1', username: 'Ropaieva' },
];

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).sendFile(indexHtmlPath);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).sendFile(indexHtmlPath);
        }

        req.user = user;
        next();
    });
}

app.get('/', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendFile(indexHtmlPath);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).sendFile(indexHtmlPath);
        }

        const foundUser = users.find(u => u.login === user.login);

        if (foundUser) {
            return res.json({
                username: foundUser.username,
                logout: 'http://localhost:3000/logout',
            });
        }

        res.status(401).sendFile(indexHtmlPath);
    });
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find(u => u.login === login && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ login: user.login }, secretKey, { expiresIn: tokenExpiry });

    res.json({ token });
});

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
