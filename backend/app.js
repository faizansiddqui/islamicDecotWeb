import e from "express";
import cookieParser from "cookie-parser";

export  const app = e();
app.use(cookieParser());
app.use(e.json());
app.use(e.urlencoded({extended:true}));

export const router = e.Router();


