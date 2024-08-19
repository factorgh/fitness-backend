import Recipe from "../models/recipe.model.js";
import User from "../models/user.model.js";

export const createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy ratings.user"
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getAllRecipe = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    console.log(recipes);
    if (!recipes) {
      return res.status(404).json({ message: "Recipes not found" });
    }
    res.json(recipes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const existingRating = recipe.ratings.find(
      (r) => r.user.toString() === req.user.id.toString()
    );
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      recipe.ratings.push({ user: req.user._id, rating });
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch recipes by meal period
export const fetchRecipesByMealPeriod = async (req, res) => {
  try {
    const { mealPeriod } = req.body;
    const recipes = await Recipe.find({ mealPeriod });
    if (!recipes)
      return res.status(404).send("No recipes found for meal period");
    res.status(200).send(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

export const savedRecipes = async (req, res) => {
  try {
    const { userId } = req.params.userId;

    // Find the user and populate the savedRecipes field
    const user = await User.findById(userId).populate("savedRecipes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the saved recipes
    res.json(user.savedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get recipes of users u are following
export const getRecipesForFollowedUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user document to get the list of followed users
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followedUsers = user.following;

    if (!followedUsers.length) {
      return res.status(404).json({ message: "No followed users found." });
    }

    // Fetch recipes for all followed users
    const recipes = [];
    for (const followedUser of followedUsers) {
      const userRecipes = await Recipe.find({
        _id: { $in: followedUser.savedRecipes },
      });
      recipes.push(...userRecipes);
    }

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
