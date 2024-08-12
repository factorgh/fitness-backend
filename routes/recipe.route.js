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
import User from "../models/user.model.js";

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

router.post("/save-recipe", async (req, res) => {
  const { userId, recipeId } = req.body;

  try {
    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ message: "User or Recipe not found" });
    }

    if (!user.savedRecipes.includes(recipeId)) {
      user.savedRecipes.push(recipeId);
      await user.save();
      return res.status(200).json({ message: "Recipe saved successfully" });
    } else {
      return res.status(400).json({ message: "Recipe already saved" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});
// Get saved recipes
router.get("/saved-recipes/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("savedRecipes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.savedRecipes);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});
router.get("/recipes/by-user", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await Recipe.find({ createdBy: userId });

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

export default router;
