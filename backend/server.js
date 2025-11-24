import dotenv from 'dotenv';
dotenv.config();
import { app } from './app.js';
import {router as adminRouter} from './router/admin.router.js';
import { router as userRouter } from './router/user.router.js';
import {router as authRouter} from './router/auth.router.js'
import cors from "cors";



app.use(cors({
  origin:["http://localhost:5500","https://islamic-decot-web.vercel.app", "http://localhost:5173","http://127.0.0.1:5500", process.env.FRONTEND_URL].filter(Boolean),
  credentials:true,
}))


app.get('/', async(request,response)=>{
  
  response.send('Welcome Back');

})

app.use('/admin',adminRouter);
app.use('/user',userRouter);
app.use('/api/auth',authRouter)



app.listen(8080,()=>{
    console.log("server is listening on 8080");
    
})
