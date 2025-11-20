import { router } from "../app.js";
// import { getOrders } from "../controller/admin.controller.js";
import {getProductById,getProductByCatagory,searchProduct,showProduct,order,createAddress,getUserProfile,getOrders,getUserAddresess,addToCart,getUserCart,removeFromCart,updateUserAddress} from "../controller/user.controller.js"
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
router.post('/add-to-cart',authMiddleware,addToCart)
router.post('/get-user-cart',authMiddleware,getUserCart)
router.get('/remove-cart/:cart_id',removeFromCart)
// router.post('/create-order',authMiddleware,createOrder)
router.patch('/update-user-address',authMiddleware,updateUserAddress);
router.post('/create-newAddress',authMiddleware,createAddress);
router.post('/get-user-addresess',authMiddleware,getUserAddresess)



export {router};