'use strict';

const axios = require('axios');

const google = axios.create({ baseURL: 'https://google.com' });

async function test_google() {
    let response = await google.get('/', { maxRedirects: 0, validateStatus: v => true });
    return response;
}

process.on('SIGINT', function () { process.exit() });
process.on('SIGTERM', function () { process.exit() });

test_google().then(v => console.log(v.data));

