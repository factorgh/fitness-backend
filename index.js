import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";
import emailRoutes from "./routes/email.route.js";

import userRoutes from "./routes/user.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import mealPlanRoutes from "./routes/mealplan.route.js";
import notificationsRoutes from "./routes/notifications.route.js";
import logger from "./utils/logger.js";

// Create path to env instance
dotenv.config();

//  Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"));

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
export const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin, modify for production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(morgan("dev"));

// Logger for errors
// Error handling example
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).send("Internal Server Error");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Email routes
app.use("/api/v1/email", emailRoutes);

// Routes for the application
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/meal-plans", mealPlanRoutes);
app.use("/api/v1/notifications", notificationsRoutes);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Example: Emit a message to the client
  socket.emit("welcome", "Welcome to the Notification System!");

  // Example: Listen for a custom event from the client
  socket.on("message", (data) => {
    console.log("Message received:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
