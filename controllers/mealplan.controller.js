import MealPlan from "../models/mealplan.model.js";
import notification from "../models/notifications.js";
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
    const mealPlans = await MealPlan.find({ trainees: traineeId }).populate(
      "recipeAllocations.recipeId"
    );

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
      await createNotificationForMealPlan(mealPlan, traineeId);
    }

    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNotificationForMealPlan = async (mealPlan, traineeId) => {
  const { startDate, endDate, days, recipeAllocations } = mealPlan;

  // Iterate through each day within the selected range
  for (let day of days) {
    let currentDate = moment(startDate);
    const dayIndex = getDayIndex(day);

    while (currentDate.isSameOrBefore(endDate)) {
      // Check if the current date matches the day index
      if (currentDate.day() === dayIndex) {
        for (let allocation of recipeAllocations) {
          const message = `Reminder: Your meal plan includes ${allocation.recipeId} at ${allocation.allocatedTime}.`;

          const notification = new Notification({
            userId: traineeId,
            message,
            type: "MealPlanReminder",
            createdAt: currentDate.toDate(),
          });

          await notification.save();
        }
      }

      // Move to the next day
      currentDate.add(1, "day");
    }
  }
};

const getDayIndex = (day) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return daysOfWeek.indexOf(day);
};
