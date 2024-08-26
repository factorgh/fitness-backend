import Recipe from "../models/recipe.model.js";
import User from "../models/user.model.js";

// Create a new recipe
export const createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    // Convert to plain object to include virtuals
    const recipeObject = recipe.toObject();
    recipeObject.averageRating = recipe.averageRating;
    res.status(201).json(recipeObject);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Get a single recipe by ID
export const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("createdBy ratings.user")
      .lean(); // Convert to plain JavaScript object

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Include the averageRating virtual property
    recipe.averageRating = recipe.averageRating;

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all recipes
export const getAllRecipe = async (req, res) => {
  try {
    const currentUserId = req.user._id; // Assuming req.user contains the authenticated user

    // Find recipes that are not created by the current user
    const recipes = await Recipe.find({
      createdBy: { $ne: currentUserId },
    }).lean(); // Adjust the query to exclude the current user's recipes

    if (!recipes.length) {
      return res.status(404).json({ message: "Recipes not found" });
    }

    // Add averageRating to each recipe
    recipes.forEach((recipe) => {
      recipe.averageRating = recipe.averageRating;
    });

    res.json(recipes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a recipe by ID
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean(); // Convert to plain JavaScript object

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Include the averageRating virtual property
    recipe.averageRating = recipe.averageRating;

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a recipe by ID
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

// Add or update a rating for a recipe
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    console.log(recipe);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log(req.user.id);
    const existingRating = recipe.ratings.find(
      (r) => r.userId.toString() === req.user.id.toString()
    );
    console.log("------------existingRating-----------", existingRating);
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      recipe.ratings.push({ userId: req.user.id, rating });
    }

    await recipe.save();

    // Convert to plain object and include averageRating
    const updatedRecipe = recipe.toObject();
    updatedRecipe.averageRating = recipe.averageRating;

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch recipes by meal period
export const fetchRecipesByMealPeriod = async (req, res) => {
  try {
    const { mealPeriod } = req.body;

    // Validate the mealPeriod
    if (!mealPeriod) {
      return res.status(400).send("Meal period is required");
    }

    // Fetch recipes by mealPeriod
    const recipes = await Recipe.find({ period: mealPeriod }).lean();

    // Check if recipes were found
    if (!recipes.length) {
      return res.status(404).send("No recipes found for the given meal period");
    }

    // Add averageRating to each recipe (if needed)
    recipes.forEach((recipe) => {
      recipe.averageRating = recipe.averageRating || 0; // Default to 0 if not present
    });

    // Send the recipes
    res.status(200).send(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching recipes");
  }
};

// Get saved recipes for a user
export const savedRecipes = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("savedRecipes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert saved recipes to plain objects and include averageRating
    const savedRecipes = user.savedRecipes.map((recipe) => {
      const recipeObject = recipe.toObject();
      recipeObject.averageRating = recipe.averageRating;
      return recipeObject;
    });

    res.json(savedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get recipes from followed users
export const getRecipesForFollowedUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followedUsers = user.following;

    if (!followedUsers.length) {
      return res.status(404).json({ message: "No followed users found." });
    }

    // Extract the IDs of the followed users
    const followedUserIds = followedUsers.map((user) => user._id);

    // Find recipes created by the followed users
    const recipes = await Recipe.find({
      createdBy: { $in: followedUserIds },
    }).lean();

    recipes.forEach((recipe) => {
      recipe.averageRating = recipe.averageRating;
    });

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// Get top rated recipes
export const getTopRatedRecipes = async (req, res) => {
  try {
    // Fetch all recipes
    const recipes = await Recipe.find();

    // Calculate averageRating
    const recipesWithRating = recipes
      .map((recipe) => ({
        ...recipe.toObject(),
        averageRating: recipe.averageRating,
      }))
      // Sort by averageRating in descending order
      .sort((a, b) => b.averageRating - a.averageRating)
      // Limit to the top 5 recipes
      .slice(0, 5);
    res.json(recipesWithRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Save a recipe to a user's saved recipes

export const saveRecipe = async (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the recipe is already saved
    if (user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already saved" });
    }

    // Add the recipe to the savedRecipes array
    user.savedRecipes.push(recipeId);

    await user.save();

    res.status(200).json({ message: "Recipe saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a saved recipe
export const removeSavedRecipe = async (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the recipe from the savedRecipes array
    user.savedRecipes = user.savedRecipes.filter(
      (id) => id.toString() !== recipeId
    );

    await user.save();

    res.status(200).json({ message: "Recipe removed from saved list" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecipesByTopTrainer = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = await Recipe.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching recipes" });
  }
};
