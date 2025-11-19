import { connection, DataTypes } from "../config/db.js";
import { User } from "./user.model.js";

const Addresses = connection.define("Addresses", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
  country: {
    type: DataTypes.STRING,
    allowNull: false,
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
});

User.hasMany(Addresses, {
  foreignKey: "user_id",
});

Addresses.belongsTo(User, {
  foreignKey: "user_id",
});

export default Addresses;
