import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  // Port 587 is the default port for SMTP, but TLS (Transport Layer Security) requires 465 or 587
  service: "gmail",
  port: 587,
  secure: false,
  debug: true,
  auth: {
    user: "burchellsbale@gmail.com",
    pass: "omcj ypcb qapd cvtq", // Your app password
  },
});

// Function to send an email
export const sendEmail = async (emailData) => {
  try {
    await transporter.sendMail(emailData);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
