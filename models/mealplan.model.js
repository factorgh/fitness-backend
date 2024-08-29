import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the RecipeAllocation schema
const recipeAllocationSchema = new Schema({
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  allocatedTime: {
    type: Date, // Use Date or another format as per your requirement
    required: true,
  },
});

// Define the MealPlan schema
const mealPlanSchema = new Schema(
  {
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
      type: [String], // List of selected days (e.g., ['Monday', 'Tuesday'])
    },
    periods: {
      type: [String], // List of selected periods (e.g., ['Breakfast', 'Lunch'])
    },
    recipeAllocations: {
      type: [recipeAllocationSchema], // Array of RecipeAllocation sub-documents
      default: [],
    },
    trainees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // Reference to the User schema
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Create the MealPlan model
const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
