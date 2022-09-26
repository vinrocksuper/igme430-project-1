const url = require('url'); // url module

const users = {};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  // object for our headers
  // Content-Type for json
  const headers = {
    'Content-Type': 'application/json',
  };

  // console.log(object);
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

const getData = (request, response) => {
  // json object to send
  const responseJSON = {
    message: ' This is a successful response',
    users,
  };

  // return 200 with message
  return respondJSON(request, response, 200, responseJSON);
};

const badRequestHandler = (request, response) => {
  const responseJSON = {
    message: ' Missing valid query parameter set to true.',
    id: 'badRequest',
  };

  if (url.parse(request.url, true).query.valid === 'true') {
    delete responseJSON.id;
    responseJSON.message = ' This request has the required parameters';
    return respondJSON(request, response, 200, responseJSON);
  }
  // return 400 with message
  return respondJSON(request, response, 400, responseJSON);
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

const addUser = async (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!body.age || !body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204; // updated by default

  if (!users[body.name]) {
    responseCode = 201;
    users[body.name] = {}; // creates a new user if not already made
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

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
  addUser,
};
