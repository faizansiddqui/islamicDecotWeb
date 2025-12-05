import dotenv from 'dotenv';
dotenv.config();
import { app } from './app.js';
import {router as adminRouter} from './router/admin.router.js';
import { router as userRouter } from './router/user.router.js';
import {router as authRouter} from './router/auth.router.js'
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));




app.get('/', async(request,response)=>{
  
  response.send('Welcome Back');

})

app.use('/admin',adminRouter);
app.use('/user',userRouter);
app.use('/api/auth',authRouter)



app.listen(8080,()=>{
    console.log("server is listening on 8080");
    
})
