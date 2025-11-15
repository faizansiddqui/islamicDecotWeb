import { Catagories } from "../model/catagory.model.js";
import { Products, ProductSpecification } from "../model/product.model.js";
import { supabase } from "../config/supabase.config.js";
import {connection} from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import  Orders  from "../model/orders.model.js";
import Addresses from "../model/addresses.model.js";

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

  if(!name)  return res.json({err:"no data recieve"})

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
    const { name, brand, title, weight, price, description, catagory, sub_Catagory, specification } = req.body;

    // parse specs (same as before)
    let specsArr = [];
    if (specification) {
      const parsed = JSON.parse(specification);
      specsArr = Object.entries(parsed).map(([key, value]) => ({ key, value }));
    }

    // Validate files count
    if (!files.length) return res.status(400).json({ message: "At least one image is required." });
    if (files.length > 5) return res.status(400).json({ message: "Maximum 5 images allowed." });

    // Find subcategory
    const result = await Catagories.findOne({
      where: { name: catagory },
      include: [{
        model: Products,
        where: { name: name },
      }],
    });

    if (!result || !result.subcatagories.length) {
      return res.status(404).json({ message: "Category or Subcategory not found" });
    }
    // const subCatagory_id = result.subcatagories[0].id;

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
    const productId = uuidv4();
    const newProduct = await Products.create({
      product_id: productId, // <-- use product_id (or `id` if your model uses `id`)
      title,
      brand,
      name,
      price,
      product_image: uploadedImageUrls[0], // optionally set the first image as main/thumbnail
      description,
      weight,
    }, { transaction });

    // Insert specifications (if any) — using product_id consistent with create above
    if (specsArr.length > 0) {
      const specsWithProductId = specsArr.map((s) => ({
        ...s,
        product_id: productId,
      }));
      await ProductSpecification.bulkCreate(specsWithProductId, { transaction });
    }

    // Insert ProductImages rows
    const imageRows = uploadedImageUrls.map((url) => ({
      id: uuidv4(),
      product_id: productId,
      image_url: url,
    }));
    await ProductImages.bulkCreate(imageRows, { transaction });

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

const getOrders = async (req,res)=>{
    const data = await Orders.findAll({
        where:{status:"Pending"},
        include:[{model:Products}]
        
    })

    if(getOrders.length === 0){
     return  res.status(404).json({message:"No orders found"})
    }
  
    res.status(200).json({status:true,orders:data})
}

export {
  addCatagory,
  uploadProduct,
  getOrders
};
