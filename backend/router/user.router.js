import { router } from "../app.js";
import {getProductById,getProductByCatagory,searchProduct,showProduct,order,createAddress} from "../controller/user.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";



router.get('/get-product-byCategory/:category',getProductByCatagory);
router.get('/get-product-byid/:id',getProductById)
router.get('/show-product',showProduct)
router.get('/search',searchProduct)
router.post('/order',authMiddleware,order)
// router.post('/create-order',authMiddleware,createOrder)
router.post('/create-newAddress',authMiddleware,createAddress);



export {router};