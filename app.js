'use strict';

const hapi = require('hapi');
const aws = require('aws-sdk');
const awsCreds = require('./aws_creds.js');

aws.config = new aws.Config({
  								accessKeyId: awsCreds.accessKeyId,
  								secretAccessKey: awsCreds.secretAccessKey,
  								region: 'us-west-2'
  							});//TODO:This isn't the best way for keys. May be use env var. But ok for now.

// Create a server with a host and port
const server = new hapi.Server();
server.connection({ 
    port: 80
});//TODO:This isn't the best way for port. May be use env var. But ok for now.

// Add the routes
var routeConfigurations = [];

const indexRouteConfigurations = require('./routes/index.js');
routeConfigurations = routeConfigurations.concat(indexRouteConfigurations);

const messageRouteConfigurations = require('./routes/message.js');
routeConfigurations = routeConfigurations.concat(messageRouteConfigurations);

server.route(routeConfigurations);

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});