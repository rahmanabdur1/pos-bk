import express from "express";
import { createUser, login, logout, refreshToken,  verifyLoginOTP } from "../controllers/newUser.controller.js";
// import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/create_new", createUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/verify-otp", verifyLoginOTP); 

// Protected Routes
// router.get("/profile", verifyToken, getProfile);

export default router;