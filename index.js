import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import userRoutes from "./routes/user.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import mealPlanRoutes from "./routes/mealplan.route.js";
import mongoose from "mongoose";

// Create path to env instance
dotenv.config({ path: "./.config.env" });

//  Connect to MongoDB

mongoose
  .connect(
    process.env.MONGODB_URL ||
      "mongodb+srv://abdulaziz021099:Rosemondlamptey@fitness.oyw5r4a.mongodb.net/fitness?retryWrites=true&w=majority&appName=FITNESS"
  )
  .then(() => console.log("Connected to MongoDB"));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

// Routes for the application
app.use(express.json());
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/mealplans", mealPlanRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
