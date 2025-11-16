import { router } from "../app.js";
import {addCatagory,uploadProduct,getOrders,updateOrderStatus} from "../controller/admin.controller.js";
import  {upload } from '../middleware/multer.middleware.js';



router.post('/add-catagory',addCatagory);


router.post('/upload-product', upload.array('images', 5), uploadProduct);
router.get('/get-orders',getOrders);
router.patch('/update-order-status',updateOrderStatus)


export {router};