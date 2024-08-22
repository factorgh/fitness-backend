// routes/email.route.js
import express from "express";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { from, to, subject, text } = req.body;

  try {
    await sendEmail(from, to, subject, text);
    res.status(200).send("Email sent");
  } catch (error) {
    res.status(500).send("Failed to send email");
  }
});

export default router;
