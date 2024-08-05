import Recipe from "../models/recipe.model.js";

export const createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
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
      (r) => r.user.toString() === req.user._id.toString()
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
