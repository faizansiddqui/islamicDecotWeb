import { supabase } from "../config/supabase.config.js";
import { v4 } from "uuid";
import { User } from "../model/user.model.js";
import { generateAccessToken, generateRefressToken } from "../services/token.js";




export const google = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
         queryParams: {
      response_type: 'code'
    },
        redirectTo: `${process.env.FRONTEND_URL}/api/auth/callback`,
      },
    });
    
    console.log(data);
    
    res.redirect(data.url);
  } catch (error) {
    throw error;
  }
};

export const varifyEmail = async (req, res) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token missing" });

        console.log(token);
        
        const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ message: "Invalid token" });

    const supabaseUser = data.user;
    const [user,created] = await User.findOrCreate({
      where: { email: supabaseUser.email },
      defaults: {
        id: supabaseUser.id,
        email: supabaseUser.email,
      },
    });

    const AccessToken = await generateAccessToken({
        id:user.id,
        email:user.email
    },process.env.JWT_SECRET);

    const RefreshToken = await generateRefressToken({
        id:user.id,
        email:user.email,
    },process.env.JWT_SECRET);

    user.refreshToken = RefreshToken;
     await user.save();

    
    res.cookie("accessToken", AccessToken, { httpOnly: true, maxAge: 15*60*1000 });
      res.cookie("refreshToken", RefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });

      res.status(200).json({Message:"Login successful check your cookie"})


  } catch (error) {
    console.error(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email not provided" });

    // Step 1: Check if email already exists in DB
    const user = await User.findOne({ where: { email } });

    //IF USER ALREADY EXIST THEN SEND COOKIES ONLY
    if (user) {
      const AccessToken = await generateAccessToken(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
      );

      const RefreshToken = await generateRefressToken(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
      );

      user.refreshToken = RefreshToken;
      await user.save();

         res.cookie("accessToken", AccessToken, { httpOnly: true, maxAge: 15*60*1000 });
      res.cookie("refreshToken", RefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });

     return  res.status(200).json({Message:"Login successful check your cookie",loginType:"normal"})

    }

    //IN CASE NEW USER WANTS TO LOGIN
    await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: "http://localhost:8080/api/auth/verify", // yaha apna callback
      },
    });

    return res.status(200).json({
      message: "Verification link sent — check email",
      loginType: "magic_link",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Supabase tokens remove karna
    res.clearCookie("sb-access-token", { httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("sb-refresh-token", { httpOnly: true, secure: true, sameSite: "none" });

    // Agar tum apne JWT use karte ho:
    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });

    return res.status(200).json({
      message: "Logout successful — all cookies cleared",
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error in logout",
      error: error.message
    });
  }
};

