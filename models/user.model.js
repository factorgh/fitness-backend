import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true, unique: true },
  role: { type: String, enum: ["0", "1"], required: true, default: "0" },
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  mealPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
