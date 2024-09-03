import express from "express";
import {
  createMealPlan,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlans,
  getMealPlansByTrainee,
  getDraftMealPlans,
  getMealsByDate,
} from "../controllers/mealplan.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.get("/", auth, getMealPlans);
router.post("/", auth, createMealPlan);

// r
// Param meal plans
router.get("/meals/:date", getMealsByDate);
router.get("/meals/draft", getDraftMealPlans);

// Other routes
router.get("/trainee/:traineeId", getMealPlansByTrainee);

router.get("/:id", auth, getMealPlan);
router.put("/:mealPlanId", auth, updateMealPlan);
router.delete("/:id", auth, deleteMealPlan);

export default router;
