import express from "express";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipe.controller.js";

const router = express.Router();

router.post("/", createRecipe);
router.get("/:id", getRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;
