import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  unfollowUser,
  followUser,
  getMe,
} from "../controllers/user.controller.js";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get my profile
router.get("/me", auth, getMe);

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Follow and unfollow feature
router.post("/follow", auth, followUser);
router.post("/follow", auth, unfollowUser);

router.post("/", auth, createUser);
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

export default router;
