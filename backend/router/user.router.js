import { router } from "../app.js";
// import { getOrders } from "../controller/admin.controller.js";
import {getProductById,getProductByCatagory,searchProduct,showProduct,order,createAddress,getUserProfile,getOrders} from "../controller/user.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";

//profile related routes
router.post('/get-user-profile',authMiddleware,getUserProfile)


//product related route
router.get('/get-product-byCategory/:category',getProductByCatagory);
router.get('/get-product-byid/:id',getProductById)
router.get('/show-product',showProduct)
router.get('/search',searchProduct)

//order related route
router.post('/create-order',authMiddleware,order)
router.post('/get-orders',authMiddleware,getOrders)
// router.post('/create-order',authMiddleware,createOrder)
router.post('/create-newAddress',authMiddleware,createAddress);



export {router};