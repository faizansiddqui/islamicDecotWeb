//user.router.js



import { router } from "../app.js";
// import { getOrders } from "../controller/admin.controller.js";
import {
    getProductById,
    getProductByCatagory,
    searchProduct,
    showProduct,
    order,
    createAddress,
    getUserProfile,
    getOrders,
    getUserAddresess,
    addToCart,
    getUserCart,
    removeFromCart,
    removeFromCartByProductId,
    clearUserCart,
    updateUserAddress,
    updateCartItem,
    saveCart,
    verifyPayment,
    cancelOrder
} from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

//profile related routes
router.post('/get-user-profile', authMiddleware, getUserProfile)


//product related route
router.get('/get-product-byCategory/:category', getProductByCatagory);
router.get('/get-product-byid/:id', getProductById)
router.get('/show-product', showProduct)
router.post('/search', searchProduct)

//order related route
router.post('/create-order', authMiddleware, order);
router.post('/get-orders', authMiddleware, getOrders);
router.post('/verify-payment',authMiddleware, verifyPayment);
router.post('/cancel-order',authMiddleware, cancelOrder);

//cart related routes
router.post('/add-to-cart', authMiddleware, addToCart);
router.post('/save-cart', authMiddleware, saveCart);
router.post('/update-cart-item', authMiddleware, updateCartItem);
router.post('/get-user-cart', authMiddleware, getUserCart);
router.get('/remove-cart/:cart_id', removeFromCart);
router.get('/remove-cart-by-product/:product_id', authMiddleware, removeFromCartByProductId);
router.post('/clear-cart', authMiddleware, clearUserCart);

//address related routes
router.patch('/update-user-address', authMiddleware, updateUserAddress);
router.post('/create-newAddress', authMiddleware, createAddress);
router.post('/get-user-addresess', authMiddleware, getUserAddresess)


export { router };