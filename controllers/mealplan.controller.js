import MealPlan from "../models/mealplan.model.js";

export const createMealPlan = async (req, res) => {
  try {
    const mealPlan = new MealPlan(req.body);
    await mealPlan.save();
    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id).populate(
      "createdBy assignedUsers mealPeriods.recipes"
    );
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal Plan not found" });
    }
    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal Plan not found" });
    }
    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findByIdAndDelete(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal Plan not found" });
    }
    res.json({ message: "Meal Plan deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
