import MealPlan from "../models/mealplan.model.js";
import Notification from "../models/notifications.js";

import moment from "moment";

// export const createMealPlan = async (req, res) => {
//   try {
//     const mealPlan = new MealPlan(req.body);
//     await mealPlan.save();
//     res.status(201).json(mealPlan);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

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
    const mealPlans = await MealPlan.find({ trainees: traineeId });

    res.json(mealPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// /Notification system management

export const createMealPlan = async (req, res) => {
  try {
    const {
      name,
      duration,
      startDate,
      endDate,
      days,
      periods,
      recipeAllocations,
      trainees,
    } = req.body;

    // Check for existing meal plans that conflict with the new one
    const conflictingMealPlans = await MealPlan.find({
      trainees: { $in: trainees },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
        {
          days: { $in: days },
        },
      ],
    });

    if (conflictingMealPlans.length > 0) {
      return res.status(400).json({
        error:
          "A meal plan already exists for the selected trainees within the specified date range or on the selected days. Please choose a different date range or days.",
      });
    }

    // Create the new meal plan since no conflicts were found
    const mealPlan = new MealPlan({
      name,
      duration,
      startDate,
      endDate,
      days,
      periods,
      recipeAllocations,
      trainees,
      createdBy: req.user.id,
    });

    await mealPlan.save();

    // Notify trainees about the new meal plan
    for (const traineeId of trainees) {
      await createNotificationForMealPlan(mealPlan, traineeId, req.user.id);
    }

    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNotificationForMealPlan = async (
  mealPlan,
  traineeId,
  createdBy
) => {
  const { startDate, endDate, days, recipeAllocations } = mealPlan;

  // Create a single notification message for the meal plan
  const message = `You have a new meal plan from ${moment(startDate).format(
    "YYYY-MM-DD"
  )} to ${moment(endDate).format(
    "YYYY-MM-DD"
  )}. It includes meals on ${days.join(", ")}.`;

  // Create a notification object
  const notification = new Notification({
    createdBy: createdBy,

    createdAt: new Date(), // Set to the current date and time
    userId: traineeId,
    message,
    type: "MealPlanReminder",
    createdAt: new Date(), // Set to the current date and time
  });

  // Save the notification to the database
  await notification.save();
};
