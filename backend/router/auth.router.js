import { router } from "../app.js";
import {google,login} from '../controller/auth.controller.js'
import { supabase } from "../config/supabase.config.js";


 router.get('/google',google);

 router.get("/callback", async (req, res) => {
  // Supabase yahan access_token ke sath redirect karega
  console.log(`${typeof req.url}:${req.url}`);
  
//   const hashFragment = req.url.split("#")[1]; // "#access_token=..."


  
//   if (!hashFragment) return res.send("No access token found.");

//   const params = new URLSearchParams(hashFragment);
//   const access_token = params.get("access_token");


const {access_token} = req.query;
console.log(access_token);


  if (!access_token) return res.send("Access token missing.");

  // Step 3: Verify user from Supabase
  const { data: { user }, error } = await supabase.auth.getUser(access_token);
  if (error) return res.send("Token invalid or expired");

  // Step 4: (Optional) Create your own JWT/session
  // e.g., using jsonwebtoken
  // const myToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

  res.json({
    message: "Google login successful",
    user,
    // myToken,
  });
});

router.post('/login',login)




export {router};