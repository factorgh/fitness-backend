import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  unfollowUser,
  followUser,
} from "../controllers/user.controller.js";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Follow and unfollow feature
router.post("/follow", auth, followUser);
router.post("/follow", auth, unfollowUser);

router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
