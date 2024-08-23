import express from "express";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, userEmail } = req.body;

  try {
    const emailData = {
      to,
      from: "burchellsbale@gmail.com",
      subject: `Fitness Trainer Request (Fitness Recipe)`,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
        <h1 style="color: #ecf0f1; margin: 0;">Fitness Recipe</h1>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.5;">
          Dear Trainer,
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          I am writing to express my interest in becoming your trainee. If you would like to accept my request, please reply with your trainer code. If you are not interested, feel free to disregard this email.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          You can reply directly to this email at <a href="mailto:${userEmail}" style="color: #2980b9;">${userEmail}</a>.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Thank you for considering my request.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Best regards.<br>
        </p>
      </div>
      <div style="background-color: #ecf0f1; padding: 10px; text-align: center;">
        <p style="font-size: 14px; color: #7f8c8d; margin: 0;">&copy; 2024 Fitness Recipe. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
    };

    await sendEmail(emailData);
    res.status(200).send("Email sent");
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to send email");
  }
});

export default router;
