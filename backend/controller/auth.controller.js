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

export const login = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ Message: "Email must be required" });

    const [user,created] = await User.findOrCreate({
      where: { email },
      defaults: {
        id: v4(),
        email: email,
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
