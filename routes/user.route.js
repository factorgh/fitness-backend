import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
