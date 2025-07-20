import { User } from "../models/User.models";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";

const userRegister = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(400, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0].path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Error while uploading in cloudinary");
  }
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Atleast one field(Username/Email) is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if(!user) {
    throw new ApiError(400,"User not registered");
  }


});

export { userRegister };
