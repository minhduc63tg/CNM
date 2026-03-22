require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region: process.env.REGION || "us-east-1",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000", // QUAN TRỌNG: Ép gọi vào Docker
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "local",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "local",
    },
});

const dynamodb = DynamoDBDocumentClient.from(client);

module.exports = { dynamodb };