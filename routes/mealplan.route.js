import express from "express";
import {
  createMealPlan,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlans,
} from "../controllers/mealplan.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.get("/", auth, getMealPlans);
router.post("/", auth, createMealPlan);

router.get("/:id", auth, getMealPlan);
router.put("/:id", auth, updateMealPlan);
router.delete("/:id", auth, deleteMealPlan);

export default router;
