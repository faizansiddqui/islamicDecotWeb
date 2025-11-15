import {connection} from '../config/db.js';
import { DataTypes } from 'sequelize';

const Catagories = connection.define('Catagories',{
    id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},
    name:{type:DataTypes.STRING,unique:true,allowNull:false}
});

export {Catagories};