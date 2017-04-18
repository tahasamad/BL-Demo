//bl-demo-message-stats-processor    
//Upon creation of message in bl-demo-messages bucket this lambda function is triggered. 
//It processes new message and creates/updates stats in bl-demo-sender-message-stats table of DynamoDB.
const aws = require("aws-sdk");
const s3 = new aws.S3();
const dynamoDB = new aws.DynamoDB();

exports.handler = (event, context, callback) => {
    const tableName = "bl-demo-sender-message-stats";
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };

    var senderId = "";
    var message = "";
    var existingCount = 0;
    var existingAverageLength = 0.0;
    
    s3.getObject(params).promise().then((object) => {
        var parsedBody = {};
        var body = object.Body;
        if (body instanceof Buffer) {
            body = body.toString("utf8");
        }
        if (typeof (body) === "string") {
            try {
                parsedBody = JSON.parse(body);
            }
            catch (parsingError) {
                throw new Error(`Parsing Error: ${parsingError.message}`);
            }
            if (typeof(parsedBody.senderId) !== "string" || parsedBody.senderId.length <= 0) {
                throw new Error("Sender Id not found on object's parsed body.");
            }
            if (typeof(parsedBody.message) !== "string" || parsedBody.message.length <= 0) {
                throw new Error("Message not found on object's parsed body.");
            }
            senderId = parsedBody.senderId;
            message = parsedBody.message;
            
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
            return promise;
        }
        else {
            throw new Error("Unexpected Data in Message.");
        }

    }).then((response) => {
        var item = {};
        if (response.Item instanceof Object) {
            item = response.Item;
            existingCount = parseInt(item.count.N);
            existingAverageLength = parseFloat(item.averageLength.N);
        }
        var newCount = (existingCount + 1);
        var newAverageLength = ((existingAverageLength * existingCount) + message.length) / newCount;
        var request = dynamoDB.putItem({
            "TableName": tableName,
            "Item": {
                "senderId": {
                    "S": senderId
                },
                "count": {
                    "N": `${newCount}`
                },
                "averageLength": {
                    "N": `${newAverageLength}`
                }
            }
        });
        var promise = request.promise();
        request.send();
        return promise;
    }).then( (response) => {
        callback(null, "DONE");
    }).catch((error) => {
        console.log(error);
        callback(error, null);
    });
};