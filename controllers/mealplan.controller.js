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
      "createdBy trainees recipes"
    );
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal Plan not found" });
    }
    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getMealPlans = async (req, res) => {
  try {
    // Fetch meal plans created by the user, sorted by creation date in descending order
    const mealPlans = await MealPlan.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    }); // -1 for descending order

    if (!mealPlans || mealPlans.length === 0) {
      return res.status(404).json({ message: "No meal plans found" });
    }

    res.json(mealPlans);
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

// / Get meal plans for a specific trainee
export const getMealPlansByTrainee = async (req, res) => {
  try {
    const { traineeId } = req.params;

    // Find meal plans where the trainee is part of the trainees array
    const mealPlans = await MealPlan.find({ trainees: traineeId }).populate(
      "recipeAllocations.recipeId"
    );

    res.json(mealPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
