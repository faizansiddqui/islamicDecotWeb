import dotenv from 'dotenv';
dotenv.config();
import { app } from './app.js';
import {router as adminRouter} from './router/admin.router.js';
import { router as userRouter } from './router/user.router.js';
import {router as authRouter} from './router/auth.router.js'
import cors from "cors";



app.use(cors({
  origin:["http://localhost:5500",process.env.FRONTEND_URL],
  credentials:true,
}))


app.get('/', async(request,response)=>{
  
  response.get('Welcome Back');

})

app.use('/admin',adminRouter);
app.use('/user',userRouter);
app.use('/api/auth',authRouter)



app.listen(8080,()=>{
    console.log("server is listening on 8080");
    
})