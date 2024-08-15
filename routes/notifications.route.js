// routes/notificationRoutes.js
import express from "express";

import notificationController from "../controllers/notifications.controller.js";
const router = express.Router();

router.get("/notifications/:userId", notificationController.getNotifications);
router.post("/notifications", notificationController.createNotification);
router.patch(
  "/notifications/:id/markAsRead",
  notificationController.markAsRead
);
export default router;
