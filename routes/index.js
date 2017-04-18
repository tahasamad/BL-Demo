'use strict';

function getIndexHandler(request, reply) {
    reply({ 
        id: request.id,
        status: "DONE",
        msg: "Hello World!"
    });
}

const getIndexRouteConfiguration = {
    method: "GET",
    path: "/",
    config: {
    	handler: getIndexHandler	
    }
};

const routeConfiguarations = [
    getIndexRouteConfiguration
];

module.exports = routeConfiguarations;