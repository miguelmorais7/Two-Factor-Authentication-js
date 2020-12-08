const express = require('express');
const speakeasy = require('speakeasy');
const uuid = require('uuid');

const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const { response, json, request } = require('express');

const app = express();
app.use(express.json());

const db = new JsonDB(new Config('myDatabase', true, false, '/'));

app.get('/api', (request, response) => response.json({ message: 'Welcome to the two factor authentication example' }));

//Register user & create temp secret
app.post('/api/register', (request, response) =>{
    const id = uuid.v4();
    try {
        const path = `/user/${id}`;
        const temp_secret = speakeasy.generateSecret();
        db.push(path, { id, temp_secret });
        response.json({ id, secret: temp_secret.base32});
    } catch (error) {
        console.log(error);
        response.status(500),json({ message: 'Error generating the secret' });
    }
});

//Verify token and make secret perm
app.post('/api/verify', (request,response) =>{
    const { token, userId } = request.body;
    try {
        const path = `/user/${userId}`;
        const user = db.getData(path);
        const { base32: secret } = user.temp_secret;
        const verified = speakeasy.totp.verify({ 
            secret, 
            encoding: 'base32',
            token: token
        });
        if(verified){
            db.push(path, { id: userId, secret: user.temp_secret});
            response.json({ verified: true});
        }
        else{
            response.json({ verified: false});
        }
    } catch (error) {
        console.log(error);
        response.status(500),json({ message: 'Error finding user' });
    }
});

//Validate token
app.post('/api/validate', (request,response) =>{
    const { token, userId } = request.body;
    try {
        const path = `/user/${userId}`;
        const user = db.getData(path);
        const { base32: secret } = user.secret;
        const tokenValidates = speakeasy.totp.verify({ 
            secret, 
            encoding: 'base32',
            token: token,
            window: 1
        });
        if(tokenValidates){
            response.json({ validated: true});
        }
        else{
            response.json({ validated: false});
        }
    } catch (error) {
        console.log(error);
        response.status(500),json({ message: 'Error finding user' });
    }
});

const port = process.env.port || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));