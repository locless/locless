import { httpRouter } from 'convex/server';
import { getFile } from './files';

const http = httpRouter();

http.route({
    path: '/serveFile',
    method: 'GET',
    handler: getFile,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
