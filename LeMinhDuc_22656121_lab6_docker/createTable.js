require("dotenv").config();
const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

// Cấu hình Client trỏ vào DynamoDB Local trên Docker
const client = new DynamoDBClient({
    region: process.env.REGION || "us-east-1",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "local",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "local",
    },
});

const createTable = async() => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME || "Products",
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" }, // Partition Key
            { AttributeName: "name", KeyType: "RANGE" } // Sort Key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" }, // S = String
            { AttributeName: "name", AttributeType: "S" } // S = String
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        console.log("Đang tiến hành tạo bảng...");
        const command = new CreateTableCommand(params);
        const response = await client.send(command);
        console.log("✅ Tạo bảng thành công:", response.TableDescription.TableName);
    } catch (error) {
        // Bắt lỗi nếu bảng đã được tạo từ trước
        if (error.name === "ResourceInUseException") {
            console.log("⚠️ Bảng 'Products' đã tồn tại, không cần tạo lại.");
        } else {
            console.error("❌ Lỗi khi tạo bảng:", error);
        }
    }
};

createTable();