const { dynamodb } = require("../utils/aws-helper");
const { v4: uuidv4 } = require("uuid");

const tableName = process.env.DYNAMODB_TABLE_NAME || "Products";

const ProductModel = {
    createProduct: async(productData) => {
        const productId = uuidv4();
        const params = {
            TableName: tableName,
            Item: {
                id: productId,
                name: productData.name,
                price: productData.price,
                quantity: productData.quantity,
                image: productData.image,
            },
        };
        try {
            await dynamodb.put(params).promise();
            return { id: productId, ...productData };
        } catch (error) {
            console.error("Error creating subject:", error);
            throw error;
        }
    },

    getProducts: async() => {
        const params = { TableName: tableName };
        try {
            const result = await dynamodb.scan(params).promise();
            return result.Items;
        } catch (error) {
            console.error("Error getting subjects:", error);
            throw error;
        }
    },

    getOneProduct: async(productId) => {
        const params = {
            TableName: tableName,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: { ":id": productId },
        };
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items[0];
        } catch (error) {
            console.error("Error getting one subject:", error);
            throw error;
        }
    },

    // Table có Partition key = id, Sort key = name
    // => Key phải truyền đủ { id, name }
    // => KHÔNG thể update field "name" vì là sort key
    // => Chỉ update: type, semester, faculty, image
    updateProduct: async(productId, productData) => {
        // Lấy name hiện tại (sort key) vì không thể đổi
        const existing = await ProductModel.getOneProduct(productId);
        if (!existing) throw new Error("Subject not found");

        const params = {
            TableName: tableName,
            Key: {
                id: productId, // Partition key
                name: existing.name, // Sort key - bắt buộc, không thể thay đổi
            },
            UpdateExpression: "set #p = :price, #q = :quantity, #i = :image",
            ExpressionAttributeNames: {
                "#p": "price",
                "#q": "quantity",

                "#i": "image",
            },
            ExpressionAttributeValues: {
                ":price": productData.price,
                ":quantity": productData.quantity,
                ":image": productData.image,
            },
            ReturnValues: "ALL_NEW",
        };
        try {
            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating subject:", error);
            throw error;
        }
    },

    // Xóa cần đủ cả { id, name } vì name là sort key
    deleteProduct: async(productId) => {
        // Lấy name (sort key) trước rồi mới xóa
        const existing = await ProductModel.getOneProduct(productId);
        if (!existing) throw new Error("Product not found");

        const params = {
            TableName: tableName,
            Key: {
                id: productId, // Partition key
                name: existing.name, // Sort key - bắt buộc khi xóa
            },
        };
        try {
            await dynamodb.delete(params).promise();
            return { id: productId };
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },
};

module.exports = ProductModel;