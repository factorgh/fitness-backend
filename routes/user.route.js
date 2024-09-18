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
  traineesDetails,
  getTrainerByCode,
  updateRole,
  getTopTrainers,
  getTraineesFromTrainerMealPlans,
  getFollowersByRole,
  removeTrainerFollower,
  getUserByName,
} from "../controllers/user.controller.js";
import {
  registerUser,
  loginUser,
  changePassword,
} from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get my profile
router.get("/me", auth, getMe);
router.get("/trainers/search", auth, searchTrainer);
router.get(
  "/meal-plans/trainees/assigned-trainees",
  auth,
  getTraineesFromTrainerMealPlans
);

router.get("/trainer/:trainerId/followers/:role", getFollowersByRole);

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", auth, changePassword);

// Follow and unfollow feature
router.post("/follow", followUser);
router.post("/unfollow", auth, unfollowUser);

// User management
router.post("/", auth, createUser);
router.get("/trainers", auth, getTrainers);
router.get("/user/:username", getUserByName);
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.put("/user/role", auth, updateRole);
router.delete("/:id", auth, deleteUser);
router.get("/trainers/search", auth, searchTrainer);
router.get("/trainers/top-rated-trainers", auth, getTopTrainers);
router.get("/mealplan/trainees/details", auth, traineesDetails);
router.delete("/user/followers/:followerId", auth, removeTrainerFollower);

router.get("/trainer/code/:code/follow", getTrainerByCode);
// endpoints for trainer functionalities
router.get("/trainer/:id/trainees", auth, getTrainerTrainees);

router.get("/trainer/:trainerId/followers", auth, getFollowers);
router.get("/trainer/:trainerId/following", auth, getFollowingTrainers);

export default router;
