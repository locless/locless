import { httpRouter } from 'convex/server';
import { createUrl, deleteHTTPFile, getFile, saveHTTPFile } from './files';

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

http.route({
    path: '/saveFile',
    method: 'POST',
    handler: saveHTTPFile,
});

http.route({
    path: '/deleteFile',
    method: 'DELETE',
    handler: deleteHTTPFile,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
