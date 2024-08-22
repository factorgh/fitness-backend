// mailer.js
import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service provider
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

// Function to send an email
export const sendEmail = async (from, to, subject, text) => {
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
