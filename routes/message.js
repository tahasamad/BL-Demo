//References:
//https://github.com/paullang/hapi-post-example/blob/master/index.js
//----------
'use strict';

const aws = require("aws-sdk");
const joi = require("joi");
const uuidV4 = require("node-uuid").v4;
const dynamoDB = new aws.DynamoDB();

function createMessage(senderId, message, reply) {
    const bucketName = "bl-demo-messages";
    var blDemoMessageBucket = new aws.S3({
        params: {
            Bucket: bucketName
        }
    });

    var messageId = uuidV4();
    var filename = `${messageId}.json`;
    var params = {
        Key: filename, 
        Body: JSON.stringify({ "senderId": senderId, "message": message })
    };
    blDemoMessageBucket.upload(params).promise().then((uploadResponse) => {
        reply({ 
            id: messageId,
            url: `https://s3-${aws.config.region}.amazonaws.com/${bucketName}/${filename}`,
            status: "DONE",
            message: `Message File Uploaded: ${filename}. Lambda function will be triggered to update stats.`
        });
    }, (uploadError) => {
        reply({ 
            status: "FAILED",
            message: `Failed to upload file. ${uploadError}`
        });
    });
}

function getSenderMessageStatsHandler(request, reply) {
    const tableName = "bl-demo-sender-message-stats";
    var senderId = encodeURIComponent(request.params.senderId);
    var stats = {
        senderId: senderId,
        count: 0,
        averageLength: 0
    };
    var request = dynamoDB.getItem({
        "TableName": tableName,
        "Key": {
            "senderId": {
                "S": senderId
            }
        }
    });
    var promise = request.promise();
    request.send();
    promise.then((response) => {
        if (response.Item instanceof Object) {
            var item = response.Item;
            stats.count = parseInt(item.count.N);
            stats.averageLength = parseFloat(item.averageLength.N);
        }
        reply({
            status: "DONE",
            message: `Found stats for senderId: ${senderId}`,
            stats: stats
        });
    }, (error) => {
        reply({
            status: "FAILED",
            message: `Unable to get stats: ${error}`
        });
    });
}

const getSenderMessageStatsRouteConfiguration = {
    method: "GET",
    path: "/sender-message-stats/{senderId}",
    config: {
        handler: getSenderMessageStatsHandler
    }
};

function getCreateMessageHandler(request, reply) {
    var senderId = request.query.senderId;
    var message = request.query.message;
    createMessage(senderId, message, reply);
}

const getCreateMessageRouteConfiguration = {
    method: "GET",
    path: "/create-message",
    config: {
        handler: getCreateMessageHandler,
        validate: {
            query: { 
                senderId: joi.string().min(1).required(), 
                message: joi.string().min(1).required()
            }
        }
    }
};

function postMessageHandler(request, reply) {
    var senderId = request.payload.senderId;
    var message = request.payload.message;
    createMessage(senderId, message, reply);
}

const postMessageRouteConfiguration = {
    method: "POST",
    path: "/message",
    config: {
        handler: postMessageHandler,
        validate: {
            payload: { 
                senderId: joi.string().min(1).required(), 
                message: joi.string().min(1).required()
            }
        }
    }
};

const routeConfiguarations = [
    getSenderMessageStatsRouteConfiguration,
    getCreateMessageRouteConfiguration,
    postMessageRouteConfiguration
];

module.exports = routeConfiguarations;