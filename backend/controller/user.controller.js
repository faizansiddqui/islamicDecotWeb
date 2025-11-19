import { Catagories } from "../model/catagory.model.js";
import { Products, ProductSpecification } from "../model/product.model.js";
import { Orders } from "../model/orders.model.js";
import { v4 } from "uuid";
import { User } from "../model/user.model.js";
import Addresses from "../model/addresses.model.js";
import AddToCart from "../model/addToCart.model.js";
import { Transaction, where } from "sequelize";

const getProductByCatagory = async (req, res) => {
  try {
    const { category } = req.params;

    const data = await Catagories.findOne({
      where: { name: category },
      include: [{ model: Products }],
    });

    res.status(200).json({ status: "ok", data });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const showProduct = async (req, res) => {
  try {
    const products = await Products.findAll();

    res.status(200).json({ status: true, products: products });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

const getProductById = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const data = await Products.findAll({
      where: { product_id: id },
      include: [{ model: ProductSpecification }],
    });

    if (!data.length) {
      return res.status(404).send("<h1>Product not found</h1>");
    }
    res.status(200).json({ status: 200, data: data });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error });
  }
};

const searchProduct = async (req, res) => {
  const { search, price } = req.body;

  //check if data recieved or not
  if (!search) return res.status(402).json({ Message: "No data recieved" });

  let whereCondition = {
    name: { [Op.iLike]: `%${search}%` },
  };

  //Add Price field in where condition in case if user wants to search with price filter
  if (price && !isNaN(price)) {
    whereCondition.price = { [Op.lte]: parseInt(price, 10) };
  }

  try {
    const result = await Products.findOne({
      where: whereCondition,
    });
    res.status(200).json({ Message: "ok", result: result });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
};

const order = async (req, res) => {
  try {
    const { quantity, address_id, product_id, decode_user } = req.body;

    // 1. Required fields check
    if (!decode_user || !address_id || !product_id || !quantity) {
      return res.status(400).json({
        error: "All required fields must be filled.",
      });
    }

    //Check if address exist or not
    const userAddess = await Addresses.findOne({
      attributes: [
        "phone1",
        "phone2",
        "state",
        "city",
        "pinCode",
        "address",
        "addressType",
        "FullName",
      ],
      where: { id: address_id },
    });

    if (!userAddess) {
      // return res.redirect(`${process.env.FRONTEND_URL}/create-address`)
      return res.status(400).json({ msg: "Address not found" });
      //frontend address create krke dobara ye route hit krega
    }

    // console.log(userAddess.dataValues);

    const payload = {
      order_id: v4(),
      user_id: decode_user,
      ...userAddess.dataValues,
      product_id,
      quantity,
    };

    const product = await Products.findOne({
      attributes: ["quantity"],
      where: { product_id },
    });

    // Check product exists
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check requested quantity valid
    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({ msg: "Cannot create order with this quantity" });
    }

    // Subtract product quantity
    const newQty = product.quantity - quantity;

    // Now update in DB
    await Products.update(
      { quantity: newQty },
      { where: { product_id } },
      { Transaction }
    );

    //CREATE USER ORDER
    await Orders.create(payload);

    res
      .status(200)
      .json({ status: true, message: "Order Created Successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Cannot create error try again" });
  }
};

const createAddress = async (req, res) => {
  const {
    phoneNo,
    pinCode,
    FullName,
    country,
    state,
    city,
    address,
    alt_Phone,
    addressType,
    decode_user,
  } = req.body;

  try {
    // 1. Required fields check
    if (
      !decode_user ||
      !FullName ||
      !pinCode ||
      !state ||
      !city ||
      !address ||
      !addressType ||
      !phoneNo ||
      !country
    ) {
      return res.status(400).json({
        error: "All required fields must be filled.",
      });
    }

    //  2. Pin code validation (Indian 6-digit)
    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({ error: "Invalid pin code format." });
    }

    // 3. Alternative phone validation (if provided)
    if (alt_Phone && !/^\d{10}$/.test(alt_Phone)) {
      return res
        .status(400)
        .json({ error: "Invalid alternative phone number." });
    }

    // 4. Address validation
    if (address.length < 8) {
      return res.status(400).json({ error: "Address is too short." });
    }

    // 5. Address type validation
    const validAddressTypes = ["home", "work"];
    if (!validAddressTypes.includes(addressType.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Address type must be either home or work." });
    }

    await Addresses.create({
      phone1: phoneNo,
      phone2: alt_Phone ? alt_Phone : null,
      state: state,
      FullName: FullName,
      city: city,
      country:country,
      pinCode: pinCode,
      address: address,
      addressType: addressType,
      user_id: decode_user,
    });

    res
      .status(200)
      .json({ status: true, message: "Address creatd Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
};

const getUserProfile = async (req, res) => {
  const { decode_user } = req.body;

  const user_data = await User.findOne({
    attributes: ["email"],
    where: { id: decode_user },
    include: [
      {
        model: Addresses,
        attributes: [
          "FullName",
          "phone1",
          "phone2",
          "state",
          "city",
          "pinCode",
          "address",
          "addressType",
        ],
      },
    ],
  });

  if (user_data.length) {
    return res.status(400).json({ status: false, msg: "No user found" });
  }
  res.status(200).json({ status: true, data: user_data });
};

const getOrders = async (req, res) => {
  const { decode_user } = req.body;
  if (!decode_user) {
    return res.status(400).json({ message: "No token provided Login first" });
  }

  const orders = await Orders.findAll({
    where: { user_id: decode_user },
  });
  console.log(JSON.stringify(orders));
  res.end();
};

const getUserAddresess = async (req, res) => {
  const { decode_user } = req.body;
  if (!decode_user) {
    return res
      .status(402)
      .json({ Message: "Cant fetch User Adress please login first" });
  }

  try {
    const userAddresess = await Addresses.findAll({
      where: { user_id: decode_user },
    });

    res.status(200).json({ status: true, data: userAddresess });
  } catch (error) {
    console.error(JSON.stringify(error));

    return res.status(500).json({ msg: "somthing went wrong" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { decode_user: user_id, product_id, quantity } = req.body;

    const cartItem = await AddToCart.create({
      user_id,
      product_id,
      quantity,
    });

    return res.json({ message: "Added to cart", cartItem });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const { decode_user: user_id } = req.body;

    const cart = await AddToCart.findAll({
      where: { user_id },
      include: [
        {
          model: Products,
          attributes: ["title", "price", "product_id", "product_image"],
        },
      ],
    });

    return res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cart_id } = req.params;

    await AddToCart.destroy({
      where: { cart_id },
    });

    return res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  getOrders,
  getUserAddresess,
  getUserProfile,
  getProductByCatagory,
  searchProduct,
  showProduct,
  getProductById,
  order,
  createAddress,
};

export const updateUserAddress = async (req, res) => {
  const {
    address_id,
    FullName,
    phone1,
    phone2,
    state,
    city,
    country,
    pinCode,
    address,
    addressType,
  } = req.body;
  const result = await Addresses.findByPk(address_id);
  if (!result) {
    return res
      .status(400)
      .json({ Message: "something went wrong.. can't find User Address" });
  }

 const updatedAddress = await Addresses.update({
    FullName,
    phone1,
    phone2,
    state,
    city,
    pinCode,
    country,
    address,
    addressType,
    
  },{where:{id:address_id}})

  res.status(200).json({ updatedAddress });
};
