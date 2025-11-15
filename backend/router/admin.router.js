import { router } from "../app.js";
import {addCatagory,uploadProduct,getOrders} from "../controller/admin.controller.js";
import  {upload } from '../middleware/multer.middleware.js';



router.post('/add-catagory',addCatagory);


router.post('/upload-product', upload.array('images', 5), uploadProduct);
router.get('/get-orders',getOrders);


export {router};