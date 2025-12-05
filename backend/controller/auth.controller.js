import { supabase } from "../config/supabase.config.js";
import { v4 } from "uuid";
import { User } from "../model/user.model.js";
import {
  generateAccessToken,
  generateRefressToken,
} from "../services/token.js";

import otpStore from "../config/otpStore.js";
import { generateOTP } from "../config/generateOtp.js";
import { resend } from "../config/nodemailer.js";

export const google = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          response_type: "code",
        },
        redirectTo: `${process.env.FRONTEND_URL}/api/auth/verify`,
      },
    });


    res.redirect(data.url);
  } catch (error) {
    throw error;
  }
};

export const varifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    // Verify OTP from closure store
   const normalizedEmail = email.trim().toLowerCase();
const isValid = otpStore.verifyOTP(normalizedEmail, otp.trim());


    if (!isValid) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

     //find or create a user
    const [user, created] = await User.findOrCreate({
      where: { email: email },
      defaults: {
        id:v4(),
        email: email,            
        refreshToken: null,
      },
    });

  

    // ✅ Generate JWT Tokens
    const AccessToken = await generateAccessToken(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    const RefreshToken = await generateRefressToken(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    // simulate saving refresh token
    user.refreshToken = RefreshToken;
    await user.save();

    // ✅ Set Cookies
    res.cookie("accessToken", AccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: true, // use false in localhost http
      sameSite: "none",
     path: "/"
    });

    res.cookie("refreshToken", RefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    return res.status(200).json({
      Message: "OTP verified, login successful",
    });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




// export const varifyEmail = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Token missing" });

    

//     const { data, error } = await supabase.auth.getUser(token);
//     if (error) return res.status(401).json({ message: "Invalid token" });

//     const supabaseUser = data.user;
//     const [user, created] = await User.findOrCreate({
//       where: { email: supabaseUser.email },
//       defaults: {
//         id: supabaseUser.id,
//         email: supabaseUser.email,
//       },
//     });

//     const AccessToken = await generateAccessToken(
//       {
//         id: user.id,
//         email: user.email,
//       },
//       process.env.JWT_SECRET
//     );

//     const RefreshToken = await generateRefressToken(
//       {
//         id: user.id,
//         email: user.email,
//       },
//       process.env.JWT_SECRET
//     );

//     user.refreshToken = RefreshToken;
//     await user.save();

//     res.cookie("accessToken", AccessToken, {
//       httpOnly: true,
//       maxAge: 15 * 60 * 1000,
//       secure: true,
//       sameSite: "none",
//     });
//     res.cookie("refreshToken", RefreshToken, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       secure: true,
//       sameSite: "none",
//     });

//     res.status(200).json({ Message: "Login successful check your cookie" });
//   } catch (error) {
//     console.error(error);
//   }
// };

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email not provided" });

     const otp = generateOTP();

   otpStore.setOTP(email.trim().toLowerCase(), otp); // closure store

  await resend.emails.send({
  from: 'Website <no-reply@kiswahmakkahstore.com>', // ✅ domain email use karo
  to: email,
  subject: "Your One-Time Login Code – Abdullah Islamic Store",
  text: `Assalamu Alaikum,

Your one-time login code for Abdullah Islamic Store is: ${otp}

This code is valid for the next 5 minutes. 
If you did not request this code, you can safely ignore this email.

JazakAllah Khair,
Abdullah Islamic Store Team
`,
  html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e5e5;">
            <tr>
              <td style="padding: 16px 24px; background:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:20px; font-weight:600;">
                  Abdullah Islamic Store
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <p style="margin:0 0 8px; font-size:14px; color:#111827;">
                  Assalamu Alaikum,
                </p>
                <p style="margin:0 0 16px; font-size:14px; color:#4b5563;">
                  Your one-time login code for <strong>Abdullah Islamic Store</strong> is:
                </p>
                <div style="text-align:center; margin: 24px 0;">
                  <div style="
                    display:inline-block;
                    padding: 12px 24px;
                    border-radius: 6px;
                    border:1px dashed #0f172a;
                    font-size:24px;
                    letter-spacing:4px;
                    font-weight:700;
                    color:#0f172a;
                    background:#f9fafb;
                  ">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">
                  This code is valid for the next <strong>5 minutes</strong>.
                </p>
                <p style="margin:0 0 16px; font-size:13px; color:#6b7280;">
                  If you did not request this code, you can safely ignore this email and your account will remain secure.
                </p>
                <p style="margin:0; font-size:13px; color:#6b7280;">
                  JazakAllah Khair,<br/>
                  <strong>Abdullah Islamic Store Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 24px; background:#f9fafb; text-align:center;">
                <p style="margin:0; font-size:11px; color:#9ca3af;">
                  This is an automated message. Please do not reply directly to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `,
});


    return res.status(200).json({ message: "OTP sent successfully" });


    // Step 1: Check if email already exists in DB
    // const user = await User.findOne({ where: { email } });

    // //IF USER ALREADY EXIST THEN SEND COOKIES ONLY
    // if (user) {
    //   const AccessToken = await generateAccessToken(
    //     { id: user.id, email: user.email },
    //     process.env.JWT_SECRET
    //   );

    //   const RefreshToken = await generateRefressToken(
    //     { id: user.id, email: user.email },
    //     process.env.JWT_SECRET
    //   );

    //   user.refreshToken = RefreshToken;
    //   await user.save();

    //   res.cookie("accessToken", AccessToken, {
    //     httpOnly: true,
    //     maxAge: 15 * 60 * 1000,
    //     sameSite: "lax", // ✅ important
    //     secure: false, // ✅ local http ke liye
    //     path: "/",
    //   });
    //   res.cookie("refreshToken", RefreshToken, {
    //     httpOnly: true,
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    //     sameSite: "lax",
    //     secure: false,
    //     path: "/",
    //   });

    //   return res
    //     .status(200)
    //     .json({
    //       Message: "Login successful check your cookie",
    //       loginType: "normal",
    //     });
    // }

  //   //IN CASE NEW USER WANTS TO LOGIN
  //  const {error} = await supabase.auth.signInWithOtp({
  //     email: email,
  //     options: {
  //       shouldCreateUser: true,
  //     },
  //   });

  //     if (error) {
  //     return res.status(400).json({ message: error.message });
  //   }
  //  return res.status(200).json({
  //     message: "OTP sent to your email",
  //   });
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
    res.clearCookie("sb-access-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("sb-refresh-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Agar tum apne JWT use karte ho:
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Logout successful — all cookies cleared",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in logout",
      error: error.message,
    });
  }
};
