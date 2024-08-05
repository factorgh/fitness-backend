import express from "express";
import {
  createMealPlan,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
} from "../controllers/mealplan.controller.js";

const router = express.Router();

router.post("/", createMealPlan);
router.get("/:id", getMealPlan);
router.put("/:id", updateMealPlan);
router.delete("/:id", deleteMealPlan);

export default router;
