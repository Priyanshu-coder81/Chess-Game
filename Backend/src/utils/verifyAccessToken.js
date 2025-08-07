import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";

export const verifyAccessToken = async (token) => {
  try {
    const user  =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const getUser = await User.findById(user?._id);
    if (getUser) {
      return user;
    }
    return null;
  } catch (e) {
    console.log("Error while verifying access tokens", e);
    return;
  }
};
