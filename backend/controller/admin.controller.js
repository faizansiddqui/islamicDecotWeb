import { Catagories } from "../model/catagory.model.js";
import { Products, ProductSpecification } from "../model/product.model.js";
import { supabase } from "../config/supabase.config.js";
import { connection } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import Orders from "../model/orders.model.js";
import Addresses from "../model/addresses.model.js";
import { json } from "sequelize";

// const addSubcatagory = async (req, res) => {
//   try {
//     const { sub_catagory, catagoryName } = req.body;

//     //find catagory
//     const catagory = await Catagories.findOne({
//       where: { name: catagoryName },
//     });

//     //check if catagroy exists
//     if (!catagory) {
//       return res.status(404).json({ Message: "Catagory not found" });
//     }

//     const data = await SubCatagories.create({
//       name: sub_catagory,
//       catagory_id: catagory.id,
//     });

//     res.send(data);
//   } catch (error) {
//     console.error(error);
//   }
// };

const addCatagory = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.json({ err: "no data recieve" })

  try {
    const result = await Catagories.create({
      name: name,
    });

    res.send(result);

  } catch (error) {


  }

};

// controller
const uploadProduct = async (req, res) => {
  const transaction = await connection.transaction();
  try {
    const files = req.files || [];
    const { name, title, price, quantity, sku, description, catagory, specification, selling_price } = req.body;


    // parse specs (same as before)
    let specsArr = [];
    if (specification) {
      const parsed = JSON.parse(specification);
      specsArr = Object.entries(parsed).map(([key, value]) => ({ key, value }));
    }

    // Validate files count
    if (!files.length) return res.status(400).json({ message: "At least one image is required." });
    if (files.length > 5) return res.status(400).json({ message: "Maximum 5 images allowed." });

    // Find or create category
    console.log(`🔵 Looking for category: "${catagory}"`);
    let result = await Catagories.findOne({
      where: { name: catagory },
    });

    if (!result) {
      // Category doesn't exist, create it
      console.log(`⚠️ Category "${catagory}" not found, creating it...`);
      try {
        result = await Catagories.create({
          name: catagory,
        }, { transaction });
        console.log(`✅ Created new category: "${catagory}" with id: ${result.id}`);
      } catch (createError) {
        console.error('❌ Error creating category:', createError);
        await transaction.rollback();
        return res.status(500).json({ message: "Failed to create category", error: createError.message });
      }
    } else {
      console.log(`✅ Found existing category: "${catagory}" with id: ${result.id}`);
    }
    const catagory_id = result.id;





    // Upload each file to Supabase and collect public URLs
    const uploadedImageUrls = [];
    for (const file of files) {
      const filePath = `product-images/${uuidv4()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (error) throw new Error("Supabase upload failed: " + (error.message || JSON.stringify(error)));

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);

      uploadedImageUrls.push(publicUrlData.publicUrl);
    }

    // Create product (ensure product_id matches your model column name)
    // NOTE: use the actual primary key column name your Products model expects.
    // const productId = uuidv4();

    // let imageurl = {...uploadedImageUrls}

    let imageUrl = { ...uploadedImageUrls }


    const newProduct = await Products.create({
      title,
      name,
      price: Number(price),
      product_image: imageUrl, //all images url in json form 
      description,
      selling_price: Number(selling_price),
      catagory_id: catagory_id,
      quantity: quantity,
      sku: sku
    }, { transaction });

    const productId = newProduct.product_id;
    if (specsArr.length > 0) {
      const specsWithProductId = specsArr.map((s) => ({
        ...s,
        product_id: productId,
      }));
      await ProductSpecification.bulkCreate(specsWithProductId, { transaction });
    }



    // Insert ProductImages rows
    // const imageRows = uploadedImageUrls.map((url) => ({
    //   id: uuidv4(),
    //   product_id: productId,
    //   image_url: url,
    // }));
    // await ProductImages.bulkCreate(imageRows, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Product uploaded successfully!",
      product: newProduct,
      images: uploadedImageUrls,
    });

  } catch (error) {
    console.error("Server error:", error);
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: "Something went wrong on the server.", error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    console.log('🔵 getProducts called - fetching all products');
    const products = await Products.findAll({
      include: [{
        model: Catagories,
        attributes: ['id', 'name'],
        required: false // Left join - include products even if category is missing
      }],
      order: [['product_id', 'DESC']]
    });

    console.log(`✅ Found ${products.length} products`);
    res.status(200).json({ status: true, products: products });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { price, selling_price, quantity } = req.body;

    console.log(`🔵 Updating product ${product_id} with:`, { price, selling_price, quantity });

    // Validate required fields
    if (price === undefined && selling_price === undefined && quantity === undefined) {
      return res.status(400).json({ message: "At least one field (price, selling_price, quantity) is required" });
    }

    // Find the product
    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prepare update object
    const updateData = {};
    if (price !== undefined) {
      updateData.price = Number(price);
    }
    if (selling_price !== undefined) {
      updateData.selling_price = Number(selling_price);
    }
    if (quantity !== undefined) {
      updateData.quantity = Number(quantity);
    }

    // Update the product
    await product.update(updateData);

    console.log(`✅ Product ${product_id} updated successfully`);
    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      product: product
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

const getOrders = async (req, res) => {
  const data = await Orders.findAll({
    where: { status: "Pending" },
    include: [{ model: Products }]

  })

  if (getOrders.length === 0) {
    return res.status(404).json({ message: "No orders found" })
  }

  res.status(200).json({ status: true, orders: data })
}

const updateOrderStatus = async (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(401).json({ Message: "Status not found" });
}

const login = (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ msg: "userName and Password required" })
  }

  const checkUserName = process.env.ADMIN_USERNAME;
  const checkPassword = process.env.PASSWORD;
  if (checkUserName === userName && checkPassword === password) {
    return res.status(200).json({ status: true, msg: "Login successfull" });
  } else {
    return res.status(401).json({ status: false, msg: "Can't login" })
  }
}



export {
  addCatagory,
  uploadProduct,
  getProducts,
  updateProduct,
  login,
  getOrders,
  updateOrderStatus
};
