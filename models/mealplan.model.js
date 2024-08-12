import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
  startDate: {
    type: Date,
    required: function () {
      return this.duration === "Custom";
    },
  },
  endDate: {
    type: Date,
    required: function () {
      return this.duration === "Custom";
    },
  },
  days: {
    type: [String], // List of selected days
  },
  periods: {
    type: [String], // List of selected periods
  },
  recipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  trainees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Reference to the User schema
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
