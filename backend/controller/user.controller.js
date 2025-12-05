//user controller

import paypal from "@paypal/checkout-server-sdk";
import paypalClient from "../config/payPal.js";
import { Catagories } from "../model/catagory.model.js";
import { Products, ProductSpecification } from "../model/product.model.js";
import { Orders } from "../model/orders.model.js";
import { v4 } from "uuid";
import { User } from "../model/user.model.js";
import Addresses from "../model/addresses.model.js";
import AddToCart from "../model/addToCart.model.js";
import { OrderItems } from "../model/orderItem.model.js";
import { ProductReviews } from "../model/productsReviews.model.js";
import { supabase } from "../config/supabase.config.js";
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
      return res
        .status(404)
        .json({ status: false, Message: "product not found" });
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
      { description: { [Op.iLike]: `%${search}%` } },
    ],
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

export const order = async (req, res) => {
  try {
    const { address_id, items, decode_user } = req.body;

    // 🔐 Validation
    if (!decode_user || !address_id || !items || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userAddress = await Addresses.findOne({
      where: { id: address_id },
    });

    if (!userAddress) {
      return res.status(400).json({ message: "Address not found" });
    }

    let totalAmount = 0;
    const productCache = [];

    // ✅ Stock check + amount calc
    for (const item of items) {
      const product = await Products.findOne({
        where: { product_id: item.product_id },
        attributes: ["selling_price", "quantity", "product_id"],
      });

      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Out of stock: ${item.product_id}`,
        });
      }

      const lineAmount = product.selling_price * item.quantity;
      totalAmount += lineAmount;

      productCache.push({ product, quantity: item.quantity });
    }

    const amountUSD = totalAmount.toFixed(2);

    // // ✅ Create main order
    // await Orders.create({
    //   order_id: orderId,
    //   user_id: decode_user,
    //   totalAmount: amountUSD,
    //   FullName: userAddress.FullName,
    //   phone1: userAddress.phone1,
    //   phone2: userAddress.phone2,
    //   state: userAddress.state,
    //   city: userAddress.city,
    //   pinCode: userAddress.pinCode,
    //   address: userAddress.address,
    //   addressType: userAddress.addressType
    // });

    // // ✅ Insert order items + reduce stock
    // for (const row of productCache) {
    //   await OrderItems.create({
    //     order_id: orderId,
    //     product_id: row.product.product_id,
    //     quantity: row.quantity,
    //     price: row.product.selling_price
    //   });

    //   const newQty = row.product.quantity - row.quantity;
    //   await Products.update(
    //     { quantity: newQty },
    //     { where: { product_id: row.product.product_id } }
    //   );
    // }

    // ✅ PayU response (UNCHANGED OUTPUT)
    // return res.status(200).json({
    //   payuUrl: process.env.PAYU_BASE_URL,
    //   params: {
    //     key: process.env.PAYU_KEY,
    //     txnid,
    //     amount: amountUSD,
    //     currency: "USD",
    //     productinfo: "USD_Payment",
    //     firstname,
    //     email,
    //     phone: userAddress.phone1,
    //     surl: process.env.PAYU_SUCCESS_URL,
    //     furl: process.env.PAYU_FAILURE_URL,
    //     hash
    //   }
    // });

    // Create PayPal Order
    // let request = new paypal.orders.OrdersCreateRequest();
    // request.prefer("return=representation");

    // request.requestBody({
    //   intent: "CAPTURE",
    //   purchase_units: [
    //     {
    //       amount: {
    //         currency_code: "USD",
    //         value: amountUSD,
    //       },
    //     },
    //   ],
    //   application_context: {
    //     return_url: `${process.env.BACKEND_URL}/paypal/success`,
    //     cancel_url: `${process.env.BACKEND_URL}/paypal/cancel`,
    //     brand_name: "Abdullah Islamic Store",
    //     user_action: "PAY_NOW",
    //   },
    // });

    // const paypalOrder = await paypalClient.execute(request);

    // PayPal order id
    // const paypalOrderId = paypalOrder.result.id;
    // ✅ Create main order
    const orderId = v4()
    await Orders.create({
      order_id: orderId,
      user_id: decode_user,
      totalAmount: amountUSD,
      FullName: userAddress.FullName,
      phone1: userAddress.phone1,
      phone2: userAddress.phone2,
      state: userAddress.state,
      city: userAddress.city,
      pinCode: userAddress.pinCode,
      address: userAddress.address,
      addressType: userAddress.addressType,
    });

    // ✅ Insert order items + reduce stock
    for (const row of productCache) {
      await OrderItems.create({
        order_id:orderId,
        product_id: row.product.product_id,
        quantity: row.quantity,
        price: row.product.selling_price,
      });
    

      const newQty = row.product.quantity - row.quantity;
      await Products.update(
        { quantity: newQty },
        { where: { product_id: row.product.product_id } }
      );
    }

    // Return the PayPal approval link
    // const approval = paypalOrder.result.links.find(
    //   (l) => l.rel === "approve"
    // ).href;

    return res.status(200).json({
      Staus:true,
      Message:"Order Created Successfully"
    });
  } catch (error) {
    console.error("Can't create order:", error);
    res.status(500).json({ message: "Can't create order" });
  }
};

export const paypalSuccess = async (req, res) => {
  try {
    const { token } = req.query; // PayPal order ID

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const response = await paypalClient.execute(request);

    const orderId = token;

    await Orders.update(
      {
        payment_status: "paid",
        status: "confirm",
        payu_payment_id: response.result.id,
      },
      { where: { order_id: orderId } }
    );

    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/order-success?orderId=${orderId}`);
  } catch (error) {
    console.error("Paypal success handler error:", error);
    return res.status(500).json({ message: "Paypal verification failed" });
  }
};

export const paypalCancel = async (req, res) => {
  const frontend = process.env.FRONTEND_URL;
  return res.redirect(`${frontend}/payment-failed`);
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
    return res
      .status(400)
      .json({ status: false, message: "User not authenticated" });
  }

  // Validate that the user actually exists in the database
  const userExists = await User.findOne({
    where: { id: decode_user },
  });

  if (!userExists) {
    return res
      .status(400)
      .json({ status: false, message: "User not found in database" });
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
    if (error.name === "SequelizeUniqueConstraintError") {
      // Check which field caused the unique constraint error
      const errors = error.errors || [];
      for (const err of errors) {
        if (err.field === "phone1") {
          return res.status(400).json({
            status: false,
            message: "An address with this phone number already exists.",
          });
        }
      }
      // If we can't identify the specific field, return a generic message
      return res.status(400).json({
        status: false,
        message: "An address with this phone number already exists.",
      });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserProfile = async (req, res) => {
  const { decode_user } = req.body;

  if (!decode_user) {
    return res
      .status(400)
      .json({ status: false, message: "User not authenticated" });
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
    Addresses: user_data.Addresses || [],
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
      include: [
        {
          model: OrderItems,
          as: "items",
          include: [
            {
              model: Products,
              attributes: [
                "product_id",
                "name",
                "price",
                "selling_price",
                "product_image",
              ],
            },
          ],
        },
      ],
    });

    const ordersWithPaymentInfo = orders.map((order) => ({
      ...order.toJSON(),
      payment_method: "Paypal",
      payu_transaction_id: order.payu_payment_id || null,
    }));

    return res.status(200).json({
      status: true,
      orders: ordersWithPaymentInfo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// const getOrders = async (req, res) => {
//   try {
//     const { decode_user } = req.body;
//     if (!decode_user) {
//       return res.status(400).json({ message: "No token provided Login first" });
//     }

//     const orders = await Orders.findAll({
//       where: { user_id: decode_user },
//       include: [{ model: Products, attributes: ['product_id', 'name', 'price', 'selling_price', 'product_image'] }]
//     });

//     // Simplify payment information - always show PayU since it's the only payment method
//     const ordersWithPaymentInfo = orders.map(order => {
//       return {
//         ...order.toJSON(),
//         payment_method: 'PayU', // Always set to PayU since it's the only payment method
//         payu_transaction_id: order.payu_payment_id || null // Use the PayU payment ID as transaction ID
//       };
//     });

//     return res.status(200).json({ status: true, orders: ordersWithPaymentInfo });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

export const cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const user_id = req.body.decode_user; // Get user ID from middleware

    if (!user_id || !order_id) {
      return res.status(400).json({ message: "No token provided Login first" });
    }

    const order = await Orders.findOne({
      where: { order_id: order_id, user_id: user_id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ status: "cancelled" });
    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res
      .status(500)
      .json({
        message: "Something went wrong cancelling order",
        error: error.message,
      });
  }
};

const getUserAddresess = async (req, res) => {
  const { decode_user } = req.body;
  if (!decode_user) {
    return res
      .status(401)
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
        product_id: product_id,
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update the existing item's quantity
      cartItem = await existingCartItem.update({
        quantity: quantity,
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
          attributes: [
            "title",
            "price",
            "selling_price",
            "product_id",
            "product_image",
          ],
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
        product_id: product_id,
      },
    });

    if (existingCartItem) {
      // Update the existing item's quantity
      const updatedItem = await existingCartItem.update({
        quantity: quantity,
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
        product_id: product_id,
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
    return res
      .status(400)
      .json({ status: false, message: "User not authenticated" });
  }

  // Verify that the address belongs to the user
  const addressRecord = await Addresses.findOne({
    where: { id: address_id, user_id: decode_user },
  });

  if (!addressRecord) {
    return res
      .status(400)
      .json({
        status: false,
        message: "Address not found or does not belong to user",
      });
  }

  try {
    const updatedAddress = await Addresses.update(
      {
        FullName,
        phone1,
        phone2: phone2 || null,
        state,
        city,
        pinCode,
        country,
        address,
        addressType,
      },
      { where: { id: address_id } }
    );

    res.status(200).json({ status: true, updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);

    // Handle specific database errors
    if (error.name === "SequelizeUniqueConstraintError") {
      // Check which field caused the unique constraint error
      const errors = error.errors || [];
      for (const err of errors) {
        if (err.field === "phone1") {
          return res.status(400).json({
            status: false,
            message: "An address with this phone number already exists.",
          });
        }
      }
      // If we can't identify the specific field, return a generic message
      return res.status(400).json({
        status: false,
        message: "An address with this phone number already exists.",
      });
    }

    return res
      .status(500)
      .json({ status: false, message: "Failed to update address" });
  }
};

export const addProductReviews = async (req, res) => {
  try {
    const { user_name, review_title, review_text, review_rate, product_id } =
    req.body;
  const reviewImage = req.file || [];

  

  if (
    !user_name ||
    !review_title ||
    !review_text ||
    !review_rate ||
    !product_id
  ) {
    return res.status(404).json({ Message: "All Fields are required" });
  }

  //If no review image then upload data only
  if (reviewImage.length === 0) {    
    await ProductReviews.create({
      user_name,
      review_text,
      review_title,
      review_rate,
      product_id,
    });
    return  res.status(200).json({message:'Prodcut review add successfully'})
  }

  const filePath = `product-images/${v4()}-${reviewImage.originalname}`;
  const { data, error } = await supabase.storage
    .from("products")
    .upload(filePath, reviewImage.buffer, { contentType: reviewImage.mimetype });

  if (error)
    throw new Error(
      "Supabase upload failed: " + (error.message || JSON.stringify(error))
    );

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(data.path);

    // console.log(publicUrlData.publicUrl);
    

  await ProductReviews.create({
    user_name,
    review_text,
    review_title,
    review_rate,
    product_id,
    review_image: publicUrlData.publicUrl,
  });

  return res.status(200).json({status:true,Message:"Add review successfull"})
    
  } catch (error) {

    console.error(error);
    return res.status(500).json({Message:"something went wrong"})
    
    
  }
};

export const getProductReviews = async (req,res) =>{
   try {
    const {product_id} = req.params;
     const result = await ProductReviews.findAll({
      where:{product_id}
     });

     res.status(200).json({staus:true,reviews:result})

   } catch (error) {
    console.error(error);
    return res.status(500).json({Message:"something went wrong"})    
    
   }
}
