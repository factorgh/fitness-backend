import express from "express";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  fetchRecipesByMealPeriod,
  deleteRecipe,
  getAllRecipe,
} from "../controllers/recipe.controller.js";
import recipeModel from "../models/recipe.model.js";
import auth from "../middleware/auth.js";
import Recipe from "../models/recipe.model.js";

const router = express.Router();
router.get("/recipe/mealPeriod", fetchRecipesByMealPeriod);
router.post("/", auth, createRecipe);
router.get("/", auth, getAllRecipe);
router.get("/:id", auth, getRecipe);
router.put("/:id", auth, updateRecipe);
router.delete("/:id", auth, deleteRecipe);

// Search funtionality
router.get("/search", async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ $text: { $search: query } })
      .skip(skip)
      .limit(Number(limit));

    const total = await recipeModel.countDocuments({
      $text: { $search: query },
    });

    res.json({
      recipes,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
