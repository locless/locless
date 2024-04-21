import { httpRouter } from 'convex/server';
import { createUrl, getFile } from './files';

const http = httpRouter();

http.route({
    path: '/serveFile',
    method: 'GET',
    handler: getFile,
});

http.route({
    path: '/createUrl',
    method: 'GET',
    handler: createUrl,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
