import MealPlan from "../models/mealplan.model.js";
import Notification from "../models/notifications.js";

import moment from "moment";

export const getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id).populate(
      "createdBy trainees"
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
    const { mealPlanId } = req.params;
    const {
      name,
      duration,
      startDate,
      endDate,
      recurrence, // Recurrence details
      meals, // Updated meals array
      customRules, // Updated custom rules
      trainees, // Updated list of trainees
    } = req.body;

    // Validate date range if the duration is "Custom"
    if (duration === "Custom" && (!startDate || !endDate)) {
      return res
        .status(400)
        .json({ error: "Start and End date are required for custom plans." });
    }

    // Check for existing meal plans that conflict with the updated one
    const conflictingMealPlans = await MealPlan.find({
      _id: { $ne: mealPlanId }, // Exclude the current meal plan being updated
      trainees: { $in: trainees },
      $or: [
        {
          $and: [
            { startDate: { $lte: new Date(endDate) } },
            { endDate: { $gte: new Date(startDate) } },
          ],
        },
      ],
    });

    if (conflictingMealPlans.length > 0) {
      return res.status(400).json({
        error:
          "A conflicting meal plan already exists for the selected trainees within the specified date range.",
      });
    }

    // Find and update the meal plan
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      mealPlanId,
      {
        name,
        duration,
        startDate,
        endDate,
        recurrence, // Updated recurrence details
        meals, // Updated meals array
        customRules, // Updated custom rules
        trainees, // Updated trainees list
      },
      { new: true } // Return the updated meal plan
    );

    if (!updatedMealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    return res.status(200).json(updatedMealPlan);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to update meal plan", details: error.message });
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

// /Notification system managementexport
export const createMealPlan = async (req, res) => {
  console.log("----------------------Request Body-------------------");
  console.log(req.body);

  try {
    const { name, trainees, duration, startDate, endDate, meals, createdBy } =
      req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid startDate or endDate" });
    }

    // Generate all dates between startDate and endDate

    const mealPlan = {
      name,
      trainees,
      duration,
      startDate: start,
      endDate: end,
      datesArray: [],
      meals: meals,
      createdBy,
    };

    // // Process each meal independently (without impacting other meals)
    // meals.forEach((meal) => {
    //   const { recurrence, mealType, recipes, timeOfDay } = meal;
    //   const recurrenceStartDate = new Date(recurrence.date); // When recurrence starts for this meal

    //   // For each date in the range, check if the meal's recurrence applies
    //   datesArray.forEach((currentDate) => {
    //     if (
    //       shouldApplyRecurrence(recurrence, recurrenceStartDate, currentDate)
    //     ) {
    //       // Check if the current date is an exception for this specific meal
    //       if (!isAfterExceptionDate(recurrence.exceptions, currentDate)) {
    //         // Multiple meals can occur on the same day, so no need to prevent duplicates by meal type
    //         mealPlan.meals.push({
    //           mealType,
    //           recipes,
    //           timeOfDay,
    //           date: currentDate,
    //           recurrence, // Keep recurrence info in the meal
    //         });
    //       }
    //     }
    //   });
    // });

    // Save the meal plan to the database
    const newMealPlan = new MealPlan(mealPlan);
    await newMealPlan.save();

    // Return the newly created meal plan
    res.status(201).json({
      message: "Meal plan created successfully!",
      mealPlan: newMealPlan,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating meal plan", error: error.message });
  }
};

// Helper function: Generate all dates between startDate and endDate
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Helper function: Check if the meal recurrence applies to a specific date
const shouldApplyRecurrence = (
  recurrence,
  recurrenceStartDate,
  currentDate
) => {
  const dayOfWeek = currentDate.getDay();
  const currentDateString = currentDate.toISOString().split("T")[0]; // Format the current date as 'YYYY-MM-DD'

  // Check if the current date is in the customDates array
  if (
    recurrence.customDates &&
    recurrence.customDates.includes(currentDateString)
  ) {
    return true; // Recurrence applies on this specific date
  }

  switch (recurrence.option) {
    case "every_day":
      return true;

    case "weekly":
      if (
        recurrence.customDates &&
        recurrence.customDates.includes(currentDateString)
      ) {
        return true;
      }
      return recurrenceStartDate.getDay() === dayOfWeek;

    case "bi_weekly":
      if (
        recurrence.customDates &&
        recurrence.customDates.includes(currentDateString)
      ) {
        return true;
      }
      return isBiWeekly(recurrenceStartDate, currentDate);

    case "custom_weekly":
      if (
        recurrence.customDates &&
        recurrence.customDates.includes(currentDateString)
      ) {
        return true;
      }
      return recurrence.customDays.includes(dayOfWeek); // customDays is an array like [1, 3, 5]

    case "monthly":
      if (
        recurrence.customDates &&
        recurrence.customDates.includes(currentDateString)
      ) {
        return true;
      }
      return recurrenceStartDate.getDate() === currentDate.getDate();

    default:
      return false;
  }
};

// Helper function: Check bi-weekly recurrence logic
const isBiWeekly = (startDate, currentDate) => {
  const diffTime = Math.abs(currentDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays % 14 === 0; // Recur every 14 days
};

// Helper function: Check if the current date is after an exception
const isAfterExceptionDate = (exceptions, currentDate) => {
  if (!exceptions || exceptions.length === 0) return false; // No exceptions
  return exceptions.some(
    (exceptionDate) =>
      new Date(exceptionDate).toDateString() === currentDate.toDateString()
  );
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
    type: "Meal Plan Reminder",
    createdAt: new Date(), // Set to the current date and time
  });

  // Save the notification to the database
  await notification.save();
};

// Get mealplans by date
export const getMealsByDate = async (req, res) => {
  try {
    const { date } = req.params; // Get the date from request params
    const targetDate = new Date(date);

    if (isNaN(targetDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Query for meal plans that have the target date in their datesArray
    const mealPlans = await MealPlan.find({
      datesArray: targetDate, // Directly query by date
    });

    if (!mealPlans.length) {
      return res
        .status(404)
        .json({ message: "No meal plans found for this date" });
    }

    // Filter meals for the specific target date
    let mealsOnDate = [];
    mealPlans.forEach((plan) => {
      const mealsForDate = plan.meals.filter((meal) => {
        return new Date(meal.date).toDateString() === targetDate.toDateString();
      });
      mealsOnDate = mealsOnDate.concat(mealsForDate);
    });

    if (!mealsOnDate.length) {
      return res
        .status(404)
        .json({ message: "No meals scheduled for this date" });
    }

    // Return the meals for the specified date
    res.status(200).json({
      message: `Meals found for date ${date}`,
      meals: mealsOnDate,
    });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ message: "Error fetching meals", error: error.message });
  }
};
// Get plans for a which is Draft is true
export const getDraftMealPlans = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ isDraft: true })
      .populate({
        path: "meals",
        populate: {
          path: "recipes",
          model: "Recipe",
        },
      })
      .exec();
    if (!mealPlan) {
      return res.status(404).json({ message: "No draft meal plan found" });
    }
    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching draft meal plan",
      error: error.message,
    });
  }
};

export const updateMealsByDate = async (req, res) => {
  try {
    const { date, meals } = req.body;
    const targetDate = new Date(date);

    if (isNaN(targetDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Find meal plans that have the target date in their datesArray
    const mealPlans = await MealPlan.find({
      datesArray: targetDate,
    });

    if (!mealPlans.length) {
      return res
        .status(404)
        .json({ message: "No meal plans found for this date" });
    }

    // Update meals for each meal plan
    for (const plan of mealPlans) {
      // Find and update meals for the target date
      const updatedMeals = plan.meals.map((meal) => {
        if (new Date(meal.date).toDateString() === targetDate.toDateString()) {
          // Update meal details here
          const newMeal = meals.find((m) => m.id === meal.id);
          return newMeal ? { ...meal, ...newMeal } : meal;
        }
        return meal;
      });

      // Update the meal plan with the new meals
      plan.meals = updatedMeals;
      await plan.save();
    }

    res.status(200).json({
      message: `Meals updated for date ${date}`,
    });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ message: "Error updating meals", error: error.message });
  }
};

// Update meals by date
export const updateMealForDate = async (req, res) => {
  const { mealPlanId, mealId, updatedMealData } = req.body;
  try {
    // Find the meal plan by its ID
    const mealPlan = await MealPlan.findById(mealPlanId);

    // Find the specific meal by its ID
    const mealIndex = mealPlan.meals.findIndex(
      (meal) => meal._id.toString() === mealId
    );

    if (mealIndex === -1) {
      throw new Error("Meal not found");
    }

    // Update the meal details
    mealPlan.meals[mealIndex] = {
      ...mealPlan.meals[mealIndex].toObject(),
      ...updatedMealData,
    };

    // Save the updated meal plan
    await mealPlan.save();

    return mealPlan;
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};
