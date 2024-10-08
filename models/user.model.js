import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      required: true,
      default: "public",
      enum: ["public", "private"], // Enum to restrict values
    },
    role: { type: String, enum: ["0", "1"], required: true, default: "0" },
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    mealPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    code: { type: String, default: null },
  },
  { timestamps: true }
); // Automatically manages created_at and updated_at

const User = mongoose.model("User", userSchema);
export default User;
