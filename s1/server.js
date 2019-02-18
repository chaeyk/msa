'use strict';

const Hapi = require('hapi');
const axios = require('axios');
const os = require('os');

const s2 = axios.create({ baseURL: 'http://s2' });
const s3 = axios.create({ baseURL: 'http://s3' });
const s4 = axios.create({ baseURL: 'http://s4' });
const google = axios.create({ baseURL: 'https://google.com' });

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
    path: '/',
    handler: (request, h) => {
        return `This is s1! ${os.hostname}`;
    }
});

server.route({
    method: 'GET',
    path: '/all',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let [ response1, response2 ] = await Promise.all([ s3.get('/s2', config), s4.get('/', config) ]);
        return { s3: response1.data, s4: response2.data };
    }
});

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
    path: '/s3',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let response = await s3.get('/', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/s4',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let response = await s4.get('/', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/delay',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let response = await s2.get('/delay', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/google',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        config.maxRedirects = 0;
        config.validateStatus = status => (status % 100 == 2 || status == 301);
        let response = await google.get('/', config);
        return response.data;
    }
});

server.route({
    method: 'GET',
    path: '/err',
    handler: async (request, h) => {
		let config = addHeaders(request, {});
        let [ response1, response2 ] = await Promise.all([ s3.get('/err', config), s4.get('/', config) ]);
        return { s3: response1.data, s4: response2.data };
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

process.on('SIGINT', function () { process.exit() });
process.on('SIGTERM', function () { process.exit() });

init();

