const express = require('express');
const speakeasy = require('speakeasy');
const uuid = require('uuid');

const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const app = express();

const db = new JsonDB(new Config('myDatabase', true, false, '/'));

app.get('/api', (request, response) => response.json({ message: 'Welcome to the two factor authentication example' }));
const port = process.env.port || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));