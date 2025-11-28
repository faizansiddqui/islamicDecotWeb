import { connection,DataTypes } from "../config/db.js";


export const User = connection.define('User',{
    id:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false,
        primaryKey:true
     },
     email:{
        type:DataTypes.STRING,
        unique:true,
     },
     refreshToken:{
      type:DataTypes.STRING,
      unique:true
     }
     
});

export default User;