const { ScanCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
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
                unit_in_stock: productData.unit_in_stock, // Đổi theo đúng yêu cầu đề bài
                url_image: productData.url_image, // Đổi theo đúng yêu cầu đề bài
            },
        };
        try {
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    },

    getProducts: async() => {
        try {
            const result = await dynamodb.send(new ScanCommand({ TableName: tableName }));
            return result.Items;
        } catch (error) {
            console.error("Error getting products:", error);
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
            const data = await dynamodb.send(new QueryCommand(params));
            return data.Items[0];
        } catch (error) {
            console.error("Error getting one product:", error);
            throw error;
        }
    },

    updateProduct: async(productId, productData) => {
        const existing = await ProductModel.getOneProduct(productId);
        if (!existing) throw new Error("Product not found");

        const params = {
            TableName: tableName,
            Key: {
                id: productId, // Partition key
                name: existing.name, // Sort key - bắt buộc, không thể thay đổi
            },
            UpdateExpression: "set price = :price, unit_in_stock = :unit_in_stock, url_image = :url_image",
            ExpressionAttributeValues: {
                ":price": productData.price,
                ":unit_in_stock": productData.unit_in_stock,
                ":url_image": productData.url_image,
            },
            ReturnValues: "ALL_NEW",
        };
        try {
            const result = await dynamodb.send(new UpdateCommand(params));
            return result.Attributes;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    deleteProduct: async(productId) => {
        const existing = await ProductModel.getOneProduct(productId);
        if (!existing) throw new Error("Product not found");

        const params = {
            TableName: tableName,
            Key: {
                id: productId,
                name: existing.name,
            },
        };
        try {
            await dynamodb.send(new DeleteCommand(params));
            return { id: productId };
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },
};

module.exports = ProductModel;