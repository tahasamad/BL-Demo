This app uses:
Node Packages: hapi.js, joi, aws-sdk, node-uuid
AWS: EC2, S3 Bucket , Lambda Function, DynamoDB

Has following features:

1) Create a message using both GET and POST Methods.
2) <messageid.json> file is created in S3 Bucket.
3) File creation is bucket triggers a Lambda Function.
4) Lambda Function pulls file, and update stats in DynamoDB.
5) User can get stats for a sender.

For details of APIs you can see `BLDemo.json` Exported Postman Collection or below:

------------------------------------------------------------

- Create Message Using Get:

GET /create-message?senderId=1&message=hellodear

------------------------------------------------------------

- Create Message Using Post:

POST /message
{
	"senderId": "1",
	"message": "hello"
}

------------------------------------------------------------

- Get Message File:

Received in Create Message Response:

`https://s3-${aws.Config.region}.amazonaws.com/${bucketName}/${filename}`

e.g. https://s3-us-west-2.amazonaws.com/bl-demo-messages/89ec0691-3522-4a8b-8a0b-ab1b93c59265.json

------------------------------------------------------------

- Get Sender Message Stats:

GET /sender-message-stats/{senderId}

------------------------------------------------------------