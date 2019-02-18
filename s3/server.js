'use strict';

const Hapi = require('hapi');
const axios = require('axios');
const os = require('os');

const s2 = axios.create({ baseURL: 'http://s2' });

const server = Hapi.server({
    port: 8080,
    debug: { log: ['error'], request: ['implementation', 'error'] },
});

const init = async () => {
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
};

const incoming_headers = [
	'x-request-id',
	'x-b3-traceid',
	'x-b3-spanid',
	'x-b3-parentspanid',
	'x-b3-sampled',
	'x-b3-flags',
	'x-ot-span-context',

    'x-user',
    'x-test',
];

function addHeaders(request, config) {
	if (!config.headers) {
		config.headers = {};
	}
	incoming_headers.forEach(header => {
		let value = request.headers[header];
		if (value) {
			config.headers[header] = value;
		}
	});
    return config;
}

server.route({
    method: 'GET',
    path: '/s2',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let response = await s2.get('/', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/err',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let response = await s2.get('/err', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return `This is s3! ${os.hostname}`;
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

process.on('SIGINT', function () { process.exit() });
process.on('SIGTERM', function () { process.exit() });

init();

