import mongoose from "mongoose";

// Recurrence schema
// Updated Recurrence schema (no mealType here)
const RecurrenceSchema = new mongoose.Schema({
  option: {
    type: String,
    enum: ["every_day", "weekly", "custom_weekly", "monthly", "bi_weekly"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  exceptions: {
    type: [Date],
    default: [],
  },
  customDays: {
    type: [Number], // Array of numbers representing days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    default: [], // Only used if option is 'custom_weekly'
    validate: {
      validator: function (v) {
        // Ensure customDays is only set when option is 'custom_weekly'
        return (
          this.option !== "custom_weekly" || (Array.isArray(v) && v.length > 0)
        );
      },
      message: "customDays must be provided for custom_weekly recurrence",
    },
  },
  customDates: {
    type: [Date], // Array of numbers representing days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    default: [], // Only used if option is 'custom_weekly'
  },
});

// Meal schema
const MealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    required: true,
  },
  recipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  timeOfDay: {
    type: String, // e.g., "08:00 AM", "12:00 PM", "07:00 PM"
    required: true,
  },
  recurrence: RecurrenceSchema,
  date: {
    type: Date,
    required: true,
  },
});

// Meal Plan schema
const MealPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    trainees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainee",
      },
    ],
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
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    datesArray: {
      type: [Date],
      validate: {
        validator: function (v) {
          // Ensure dates in the array are within the startDate and endDate
          return v.every(
            (date) => date >= this.startDate && date <= this.endDate
          );
        },
        message: "Dates must be between startDate and endDate",
      },
    },
    meals: [MealSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
export default MealPlan;
