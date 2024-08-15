import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  unfollowUser,
  followUser,
  getMe,
  getTrainerTrainees,
  getTrainers,
  getFollowers,
  getFollowingTrainers,
  searchTrainer,
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
router.post("/unfollow", auth, unfollowUser);

// User management
router.post("/", auth, createUser);
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);
router.get("/trainers/search", auth, searchTrainer);

// endpoints for trainer functionalities
router.get("/trainer/:id/trainees", auth, getTrainerTrainees);
router.get("/trainers", auth, getTrainers);
router.get("/trainer/:trainerId/followers", auth, getFollowers);
router.get("/trainer/:trainerId/following", auth, getFollowingTrainers);

export default router;
