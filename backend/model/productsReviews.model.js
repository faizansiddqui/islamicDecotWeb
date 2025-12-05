import { connection,DataTypes } from "../config/db.js";
import { Products } from "./product.model.js";



export const ProductReviews = connection.define('ProductReviews',{
    user_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    review_title:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    review_text:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    review_rate:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    review_image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    product_id:{
        type:DataTypes.INTEGER
    }
});

Products.hasMany(ProductReviews,{
    foreignKey:'product_id',
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
});

ProductReviews.belongsTo(Products,{
    foreignKey:"product_id"
})