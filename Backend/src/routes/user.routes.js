import { Router } from "express";
import {
  userLogin,
  userRegister,
  userLoggedOut,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAvatar,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  userRegister
);
router.post("/login", userLogin);
router.post("/refresh-token", refreshAccessToken);

// Protected routes (authentication required)
router.use(verifyJWT); // Apply middleware to all routes below
router.post("/logout", userLoggedOut);
router.get("/current-user", getCurrentUser);
router.patch("/change-password", changeCurrentPassword);
router.patch("/update-avatar", upload.single("avatar"), updateAvatar);

export default router;
