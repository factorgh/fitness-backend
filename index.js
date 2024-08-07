import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import userRoutes from "./routes/user.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import mealPlanRoutes from "./routes/mealplan.route.js";
import mongoose from "mongoose";
import morgan from "morgan";

// Create path to env instance
dotenv.config();

//  Connect to MongoDB

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(morgan("dev"));

// Routes for the application
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/mealplans", mealPlanRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
