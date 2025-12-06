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
    // unique: true,
  },
  phone2: {
    type: DataTypes.STRING,
    allowNull: true,
    // unique: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
   country: {
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
    type: DataTypes.ENUM("pending" ,"ongoing", "confirm" ,"rto", "reject" , "delivered","cancelled"),
    defaultValue: "pending",
  },
  quantity:{
    type:DataTypes.INTEGER,
    allowNull:false,
    defaultValue:1,
  },
  payu_payment_id:{
    type:DataTypes.STRING,
    allowNull:true
  },
  totalAmount:{
    type:DataTypes.STRING, //IN PAISE
    allowNull:false
  },
  payment_status:{
    type:DataTypes.ENUM('paid','pending','failed'),
    defaultValue:'pending'
  },
    user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  // product_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: 'Products',
  //     key: 'product_id'
  //   }
  // },

});

//ORDERS
User.hasMany(Orders, {
  foreignKey: "user_id",
});

Orders.belongsTo(User, {
  foreignKey: "user_id",
});

// Products.hasMany(Orders,{
//   foreignKey:"product_id",
//   onDelete:"CASCADE",
//   onUpdate:"SET NULL"
// })

// Orders.belongsTo(Products,{
//   foreignKey:"product_id"
// })


export default Orders;