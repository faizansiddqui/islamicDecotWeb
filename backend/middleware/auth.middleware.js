import { varifyToken } from "../services/token.js";
import { User } from "../model/user.model.js";
import {
  generateAccessToken,
} from "../services/token.js";

async function checkRefreshToken(refreshToken,req, res, next) {
  //If no Refresh
  if (!refreshToken) {
    res.redirect(`${process.env.FRONTEND_ULR}/login`);
  }

  const decoded = await varifyToken(refreshToken, process.env.JWT_SECRET);
  if (decoded.status !== "ok") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ where: { refreshToken } });

  // If no user found with this refresh token
  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  if (refreshToken !== user.refreshToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const data = {
    id: user.id,
    email: user.email,
  };
  const AccessToken = await generateAccessToken(data, process.env.JWT_SECRET);



  res.cookie("accessToken", AccessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

    req.body.decode_user= decoded.id;
 

  next();
}

export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req?.cookies?.accessToken;
    const { refreshToken } = req?.cookies;


    if (!accessToken) {

      return checkRefreshToken(refreshToken,req, res, next);

    }

    const decoded = await varifyToken(accessToken, process.env.JWT_SECRET);
    if(decoded.status !== 'ok'){
      return checkRefreshToken(refreshToken,req,res,next);
    }
     
    

    
    
    req.body.decode_user = decoded.id;
    next();
  } catch (error) {
    console.log(error);
  }
};
