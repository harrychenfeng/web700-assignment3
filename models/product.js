const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
 
const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
 
        name: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
 
        category: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
 
        brand: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
 
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
 
        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "stock_quantity"
        },
 
        available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
 
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "created_at"
        },
 
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "updated_at"
        }
    },
    {
        tableName: "products",
        timestamps: true
    }
);
 
module.exports = Product;