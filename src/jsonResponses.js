const url = require('url'); // url module

const walkers = {};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  // object for our headers
  // Content-Type for json
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  // object for our headers
  // Content-Type for json
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response without json object, just headers
  response.writeHead(status, headers);
  response.end();
};

const badRequestHandler = (request, response) => {
  const responseJSON = {
    message: ' Name is not found.',
    id: 'badRequest',
  };

  if (walkers[url.parse(request.url, true).query.name]) {
    delete responseJSON.id;
    responseJSON.message = 'Loaded!';
    responseJSON.user = walkers[url.parse(request.url, true).query.name];

    return respondJSON(request, response, 200, responseJSON);
  }
  // return 400 with message
  return respondJSON(request, response, 400, responseJSON);
};

const getData = (request, response) => {
  // json object to send
  const responseJSON = {
    message: ' This is a successful response',

  };

  const { name } = url.parse(request.url, true);

  // If the saved name exists, then send it
  if (walkers[name]) {
    responseJSON.walkers = walkers[name];
    // return 200 with message
    return respondJSON(request, response, 200, responseJSON);
  }
  return badRequestHandler(request, response);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: ' The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

const badRequestHandlerMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

const getDataMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

const saveWalkers = async (request, response, body) => {
  const responseJSON = {
    message: 'Name is required to save walkers',
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204; // updated by default

  if (!walkers[body.name]) {
    responseCode = 201;
    walkers[body.name] = {}; // creates a new user if not already made
  }

  // stores data on serverside
  // retrieve it by calling the same name
  walkers[body.name].name = body.name;
  walkers[body.name].walkers = body.walkers;

  if (responseCode === 201) {
    responseJSON.message = 'user created successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

// set public modules
module.exports = {
  getData,
  getDataMeta,
  notFound,
  notFoundMeta,
  badRequestHandler,
  badRequestHandlerMeta,
  saveWalkers,
};
