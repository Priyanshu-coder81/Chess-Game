import mongoose from "mongoose";
import { DB_NAME } from "../message.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.log("ERROR : ", error);
    process.exit(1);
  }
};

export default connectDB;