import { varifyToken } from "../services/token.js";
import { User } from "../model/user.model.js";
import {
  generateAccessToken,
} from "../services/token.js";

async function checkRefreshToken(refreshToken, req, res, next) {
  if (!refreshToken) {
    return res.status(401).json({ Message: "Unauthorized user" });
  }

  const decoded = await varifyToken(refreshToken, process.env.JWT_SECRET);

  if (decoded && decoded.id) {
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.body.decode_user = user.id;
    return next();
  }

  const user = await User.findOne({ where: { refreshToken } });

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

  const accessToken = await generateAccessToken(data, process.env.JWT_SECRET);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  req.body.decode_user = user.id;
  next();
}


export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    const refreshToken =
      req.cookies?.refreshToken ||
      req.headers["refreshtoken"];

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // 1. Try access token
    if (accessToken) {
      const decoded = await varifyToken(accessToken, process.env.JWT_SECRET);
     if (decoded && decoded.id) {
  req.body.decode_user = decoded.id;
  return next();
}
    }

    // 2. Try refresh token
    if (refreshToken) {
      return checkRefreshToken(refreshToken, req, res, next);
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(403).json({ message: "Forbidden" });
  }
};

