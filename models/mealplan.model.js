import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: {
    type: String,
    enum: [
      "Does Not Repeat",
      "Week",
      "Month",
      "Quarter",
      "Half-Year",
      "Year",
      "Custom",
    ],
    default: "Does Not Repeat",
  },
  days: {
    type: [String],
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  mealPeriods: [
    {
      period: {
        type: String,
        enum: ["Breakfast", "Lunch", "Snack", "Dinner"],
        required: true,
      },
      time: { type: String, required: true },
      recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan;
