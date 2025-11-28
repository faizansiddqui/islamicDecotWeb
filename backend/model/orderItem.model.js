import Orders from "./orders.model.js";
import { Products } from "./product.model.js";
import { connection,DataTypes } from "../config/db.js";

export const OrderItems = connection.define("OrderItems", {
  order_item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "Orders",
      key: "order_id"
    }
  },

  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Products",
      key: "product_id"
    }
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  price: {
    type: DataTypes.STRING,
    allowNull: false
  }
});


// Order -> OrderItems
Orders.hasMany(OrderItems, {
  foreignKey: "order_id",
  as: "items",
  onDelete:"CASCADE",
  onUpdate:"CASCADE"
});

OrderItems.belongsTo(Orders, {
  foreignKey: "order_id",
  
});

// Product -> OrderItems
Products.hasMany(OrderItems, {
  foreignKey: "product_id",
});

OrderItems.belongsTo(Products, {
  foreignKey: "product_id"
});
