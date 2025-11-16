import { connection, DataTypes } from "../config/db.js";
import { User } from "./user.model.js";
import { Products } from "./product.model.js";

export const Orders = connection.define("Orders", {
  order_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone1: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone2: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  addressType: {
    type: DataTypes.ENUM("work", "home"),
    defaultValue: "home",
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending" , "confirm" , "reject" , "delivered"),
    defaultValue: "Pending",
  },
});

//ORDERS
User.hasMany(Orders, {
  foreignKey: "user_id",
});

Orders.belongsTo(User, {
  foreignKey: "user_id",
});

Products.hasMany(Orders,{
  foreignKey:"product_id",
  onDelete:"CASCADE",
  onUpdate:"SET NULL"
})

Orders.belongsTo(Products,{
  foreignKey:"product_id"
})


export default Orders;