import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference User
    ref: "User",
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

// Recipe schema
const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    description: { type: String, required: true },
    facts: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "public",
      enum: ["public", "private"], // Restrict to public or private
    },
    ratings: [ratingSchema],
    period: { type: String }, // Could be expanded into an enum if period has predefined values
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Add a text index on title and instructions
recipeSchema.index({ title: "text", instructions: "text" });

// Virtual for calculating average rating
recipeSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.ratings.length;
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
