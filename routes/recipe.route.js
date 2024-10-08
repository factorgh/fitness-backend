import express from "express";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  fetchRecipesByMealPeriod,
  deleteRecipe,
  getAllRecipe,
  savedRecipes,
  addRating,
  getRecipesForFollowedUsers,
  getTopRatedRecipes,
  saveRecipe,
  removeSavedRecipe,
  getRecipesByTopTrainer,
} from "../controllers/recipe.controller.js";
import recipeModel from "../models/recipe.model.js";
import auth from "../middleware/auth.js";
import Recipe from "../models/recipe.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const router = express.Router();

//
router.get("/user/by-user/", auth, async (req, res) => {
  console.log("<------user on by user---->", req.user);
  // Inside your route handler
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    // Extract user ID from the authenticated request
    const userId = req.user?.id;
    console.log(userId);
    // Check if user ID is present
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    console.log("-------reqUserId---------", userId);

    // Fetch recipes created by the user
    const recipes = await Recipe.find({ createdBy: userId });

    // Return recipes with a success status
    return res.status(200).json(recipes);
  } catch (error) {
    // Log and return a server error message
    console.error("Error fetching recipes by user:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

router.post("/recipe/save", saveRecipe);
router.post("/recipe/remove", removeSavedRecipe);
router.get("/recipe/mealPeriod", auth, fetchRecipesByMealPeriod);
router.post("/rate-recipe/recipe/:id", auth, addRating);
router.get("/user/:userId/followed-recipes", getRecipesForFollowedUsers);
router.get("/recipe/highest-rated", auth, getTopRatedRecipes);
router.get("/top-trainers/recipe/:userId", auth, getRecipesByTopTrainer);

router.post("/", auth, createRecipe);
router.get("/", auth, getAllRecipe);
router.post("/save-recipe", savedRecipes);
router.get("/:id", auth, getRecipe);
router.put("/:id", auth, updateRecipe);
router.delete("/:id", auth, deleteRecipe);

router.get("/user/:userId/saved-recipes", savedRecipes);

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

// // Get saved recipes
// router.get("/saved-recipes/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId).populate("savedRecipes");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json(user.savedRecipes);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error });
//   }
// });

export default router;
