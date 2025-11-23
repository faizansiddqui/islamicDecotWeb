//user controller


import { Catagories } from "../model/catagory.model.js";
import { Products, ProductSpecification } from "../model/product.model.js";
import { Orders } from "../model/orders.model.js";
import { v4 } from "uuid";
import { User } from "../model/user.model.js";
import Addresses from "../model/addresses.model.js";
import AddToCart from "../model/addToCart.model.js";
import { razorpay } from "../config/razorpay.js";
import { Transaction, where, Op } from "sequelize";

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

  //check if data received or not
  if (!search) return res.status(402).json({ message: "No data received" });

  let whereCondition = {
    [Op.or]: [
      { name: { [Op.iLike]: `%${search}%` } },
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ]
  };

  //Add Price field in where condition in case if user wants to search with price filter
  if (price && !isNaN(price)) {
    whereCondition.price = { [Op.lte]: parseInt(price, 10) };
  }

  try {
    const result = await Products.findAll({
      where: whereCondition,
    });
    res.status(200).json({ message: "ok", result: result });
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
      // return res.redirect(${process.env.FRONTEND_URL}/create-address)
      return res.status(400).json({ msg: "Address not found" });
      //frontend address create krke dobara ye route hit krega
    }




    const product = await Products.findOne({
      attributes: ["quantity", "selling_price"],
      where: { product_id },
    });

    // Check product exists
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check requested quantity valid

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ msg: "Invalid quantity" });

    if (product.quantity < qty) {
      return res.status(400).json({ msg: "Requested quantity not available" });
    }

    const subtotal = parseFloat(product.selling_price) * qty; // rupees
    const amountPaise = Math.round(subtotal * 100); // in paise

    const localOrderId = v4();


    // Create Razorpay order
    const rOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: localOrderId,
      payment_capture: 1, // auto-capture; set to 0 if you want manual capture
    });


    //ORDER PAYLOAD
    const payload = {
      order_id: localOrderId,
      user_id: decode_user,
      ...userAddess.dataValues,
      product_id,
      quantity: qty,
      razorpay_order_id: rOrder.id,
      totalAmount: amountPaise
    };



    // //CREATE USER ORDER
    await Orders.create(payload);

    // Return order info to client (client will open checkout)
    return res.status(200).json({
      status: true,
      razorpay_order: rOrder,
      local_order_id: localOrderId,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Cannot create error try again" });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id, // your local order id (receipt)
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Find local order
    const orderData = await Orders.findOne({ where: { order_id } });
    if (!orderData) return res.status(404).json({ message: "Order not found" });

    // Idempotency: if already paid, return success
    if (orderData.payment_status === "PAID") {
      return res.json({ success: true, message: "Already marked PAID" });
    }

    // Use transaction to update stock + order atomically
    await sequelize.transaction(async (t) => {
      const product = await Products.findOne({ where: { product_id: orderData.product_id }, transaction: t, lock: t.LOCK.UPDATE });

      if (!product) throw new Error("Product missing");

      if (product.quantity < orderData.quantity) {
        throw new Error("Insufficient stock at moment of verification");
      }

      // reduce stock
      const newQty = product.quantity - orderData.quantity;
      await Products.update({ quantity: newQty }, { where: { product_id: product.product_id }, transaction: t });

      // Update order status
      await Orders.update(
        { payment_status: "PAID", razorpay_payment_id },
        { where: { order_id }, transaction: t }
      );
    });

    return res.json({ success: true, message: "Payment verified and stock updated" });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ error: error.message || "Verification failed" });
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

  if (!decode_user) {
    return res.status(400).json({ status: false, message: "User not authenticated" });
  }

  // Validate that the user actually exists in the database
  const userExists = await User.findOne({
    where: { id: decode_user }
  });

  if (!userExists) {
    return res.status(400).json({ status: false, message: "User not found in database" });
  }

  try {
    // 1. Required fields check
    if (
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
      country: country,
      pinCode: pinCode,
      address: address,
      addressType: addressType,
      user_id: decode_user,
    });

    res
      .status(200)
      .json({ status: true, message: "Address created Successfully" });
  } catch (error) {
    console.error(error);

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Check which field caused the unique constraint error
      const errors = error.errors || [];
      for (const err of errors) {
        if (err.field === 'phone1') {
          return res.status(400).json({
            status: false,
            message: "An address with this phone number already exists."
          });
        }
      }
      // If we can't identify the specific field, return a generic message
      return res.status(400).json({
        status: false,
        message: "An address with this phone number already exists."
      });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserProfile = async (req, res) => {
  const { decode_user } = req.body;

  if (!decode_user) {
    return res.status(400).json({ status: false, message: "User not authenticated" });
  }

  const user_data = await User.findOne({
    attributes: ["id", "email"],
    where: { id: decode_user },
    include: [
      {
        model: Addresses,
        attributes: [
          "id",
          "FullName",
          "phone1",
          "phone2",
          "state",
          "city",
          "country",
          "pinCode",
          "address",
          "addressType",
        ],
      },
    ],
  });


  if (!user_data) {
    return res.status(400).json({ status: false, message: "No user found" });
  }

  // Ensure the ID is explicitly included in the response
  const response_data = {
    id: user_data.id,
    email: user_data.email,
    Addresses: user_data.Addresses || []
  };

  res.status(200).json({ status: true, data: response_data });
};

const getOrders = async (req, res) => {
  try {
    const { decode_user } = req.body;
    if (!decode_user) {
      return res.status(400).json({ message: "No token provided Login first" });
    }

    const orders = await Orders.findAll({
      where: { user_id: decode_user },
      include: [{ model: Products, attributes: ['product_id', 'name', 'price', 'selling_price', 'product_image'] }]
    });

    return res.status(200).json({ status: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });


  }
};

export const cancelOrder = async (req,res)=>{
  try {
    const { order_id } = req.body;
    const user_id = req.body.decode_user; // Get user ID from middleware

    if (!user_id || !order_id) {
      return res.status(400).json({ message: "No token provided Login first" });
    }

    const order = await Orders.findOne({
      where: { order_id: order_id, user_id: user_id }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ status: "cancelled" });
    return res.status(200).json({ message: "Order cancelled successfully" });
    
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Something went wrong cancelling order", error: error.message });
  }
}

const getUserAddresess = async (req, res) => {
  const { decode_user } = req.body;
  if (!decode_user) {
    return res
      .status(402)
      .json({ message: "Can't fetch User Address please login first" });
  }

  try {
    const userAddresess = await Addresses.findAll({
      where: { user_id: decode_user },
    });

    res.status(200).json({ status: true, data: userAddresess });
  } catch (error) {
    console.error(JSON.stringify(error));

    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { decode_user: user_id, product_id, quantity } = req.body;

    // Check if the item already exists in the cart
    const existingCartItem = await AddToCart.findOne({
      where: {
        user_id: user_id,
        product_id: product_id
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update the existing item's quantity
      cartItem = await existingCartItem.update({
        quantity: quantity
      });
    } else {
      // Create a new cart item
      cartItem = await AddToCart.create({
        user_id,
        product_id,
        quantity,
      });
    }

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
          attributes: ["title", "price", "selling_price", "product_id", "product_image"],
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

// Clear user's entire cart
export const clearUserCart = async (req, res) => {
  try {
    const { decode_user: user_id } = req.body;

    await AddToCart.destroy({
      where: { user_id: user_id },
    });

    return res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const { decode_user: user_id } = req.body;

    // Find the existing cart item
    const existingCartItem = await AddToCart.findOne({
      where: {
        user_id: user_id,
        product_id: product_id
      }
    });

    if (existingCartItem) {
      // Update the existing item's quantity
      const updatedItem = await existingCartItem.update({
        quantity: quantity
      });
      return res.json({ message: "Cart item updated", cartItem: updatedItem });
    } else {
      return res.status(404).json({ message: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save entire cart (replace current cart with new items)
export const saveCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const { decode_user: user_id } = req.body;

    // First, clear the existing cart
    await AddToCart.destroy({
      where: { user_id: user_id },
    });

    // Then add all new items
    const savedItems = [];
    for (const item of cartItems) {
      const savedItem = await AddToCart.create({
        user_id,
        product_id: item.product_id || item.id,
        quantity: item.quantity,
      });
      savedItems.push(savedItem);
    }

    return res.json({ message: "Cart saved", cartItems: savedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove item from cart by product ID
export const removeFromCartByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { decode_user: user_id } = req.body;

    await AddToCart.destroy({
      where: {
        user_id: user_id,
        product_id: product_id
      },
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
    decode_user,
  } = req.body;

  if (!decode_user) {
    return res.status(400).json({ status: false, message: "User not authenticated" });
  }

  // Verify that the address belongs to the user
  const addressRecord = await Addresses.findOne({
    where: { id: address_id, user_id: decode_user }
  });

  if (!addressRecord) {
    return res
      .status(400)
      .json({ status: false, message: "Address not found or does not belong to user" });
  }

  try {
    const updatedAddress = await Addresses.update({
      FullName,
      phone1,
      phone2: phone2 || null,
      state,
      city,
      pinCode,
      country,
      address,
      addressType,
    }, { where: { id: address_id } });

    res.status(200).json({ status: true, updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Check which field caused the unique constraint error
      const errors = error.errors || [];
      for (const err of errors) {
        if (err.field === 'phone1') {
          return res.status(400).json({
            status: false,
            message: "An address with this phone number already exists."
          });
        }
      }
      // If we can't identify the specific field, return a generic message
      return res.status(400).json({
        status: false,
        message: "An address with this phone number already exists."
      });
    }

    return res.status(500).json({ status: false, message: "Failed to update address" });
  }
};
