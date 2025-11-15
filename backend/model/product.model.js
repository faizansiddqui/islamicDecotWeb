import { connection } from "../config/db.js";
import { DataTypes } from "sequelize";
import { Catagories } from "./catagory.model.js";



const Products = connection.define("Products", {
  product_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title:{
    type:DataTypes.TEXT,
  },
  sku:{
      type:DataTypes.STRING,
      allowNull:true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  catagory_id: {
  type: DataTypes.INTEGER,
  allowNull: false
}

});

//Product specification table
const ProductSpecification = connection.define("ProductSpecification", {
  spec_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});



// 2. Define the Association (This is the key step)
Catagories.hasMany(Products, {
  foreignKey: "catagory_id", // This creates the `subcategory_id` foreign key in the `Product` table
  onDelete:"CASCADE"
});
Products.belongsTo(Catagories, {
  foreignKey: "catagory_id", // This also defines the foreign key on the Product side
});

// Relation
Products.hasMany(ProductSpecification, { foreignKey: "product_id", onDelete: "CASCADE" });
ProductSpecification.belongsTo(Products, { foreignKey: "product_id" });




export { Products,ProductSpecification };
