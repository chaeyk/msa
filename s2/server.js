'use strict';

const Hapi = require('hapi');
const os = require('os');
const Boom = require('boom');

const server = Hapi.server({
    port: 8080,
    debug: { log: ['error'], request: ['implementation', 'error'] },
});

const init = async () => {
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
};

server.route({
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
        await sleep(5000);
        return `This is s2! ${os.hostname}`;
    }
});

server.route({
    method: 'GET',
    path: '/err',
    handler: (request, h) => {
        return Boom.badRequest(`Not good~ ${os.hostname}`);
    }
});

server.route({
    method: 'GET',
    path: '/err5',
    handler: (request, h) => {
        return Boom.badGateway(`I'm gone. ${os.hostname}`);
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

server.route({
    method: 'GET',
    path: '/delay',
    handler: async (request, h) => {
        await sleep(5000);
        return 'delayed';
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

process.on('SIGINT', function () { process.exit() });
process.on('SIGTERM', function () { process.exit() });

init();

