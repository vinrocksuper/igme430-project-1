const http = require('http'); // http module
const url = require('url'); // url module
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const jsonUrlStruct = {
  GET: {
    notFound: jsonHandler.notFound,
    '/getUsers': jsonHandler.getData,
    '/notReal': jsonHandler.notFound,
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
  },
  HEAD: {
    notFound: jsonHandler.notFoundMeta,
    '/getUsers': jsonHandler.getDataMeta,
    '/notReal': jsonHandler.badRequestHandlerMeta,
    '/': jsonHandler.getData,
  },
};

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const handlePost = (request, response, parsedUrl) => {
  // If they go to /addUser
  if (parsedUrl.pathname === '/saveWalkers') {
    // Call our below parseBody handler, and in turn pass in the
    // jsonHandler.addUser function as the handler callback function.
    parseBody(request, response, jsonHandler.saveWalkers);
  }
};

// function to handle requests
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  console.log(request.url);
  if (request.method === 'POST') {
    return handlePost(request, response, parsedUrl);
  } if (request.method === 'GET' || request.method === 'HEAD') {
    if (!jsonUrlStruct[request.method]) {
      return jsonUrlStruct.HEAD.notFound(request, response);
    }
    if (jsonUrlStruct[request.method][parsedUrl.pathname]) {
      return jsonUrlStruct[request.method][parsedUrl.pathname](request, response);
    }
    return jsonUrlStruct[request.method].notFound(request, response);
  }
  return jsonUrlStruct.GET.notFound(request, response);
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
