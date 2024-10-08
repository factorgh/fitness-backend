import express from "express";
import { sendEmail } from "../utils/mailer.js";
import User from "../models/user.model.js";

const router = express.Router();

export const getUserByEmail = async (email) => {
  console.log("------------------Email passed  In-----------------");
  console.log(email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    console.log(
      "--------------------User detail before Email sent------------------"
    );
    console.log(user);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// router.post("/send-email", async (req, res) => {
//   const { to, userEmail } = req.body;

//   if (!to || !userEmail) {
//     return res.status(400).json({ message: "Invalid email or user email" });
//   }

//   // Fetch the user details from the database
//   const trainer = await getUserByEmail(to);
//   const traineee = await getUserByEmail(userEmail);

//   try {
//     const emailData = {
//       to,
//       from: "burchellsbale@gmail.com",
//       subject: `Fitness Trainer Request (Fitness Recipe)`,
//       html: `
//   <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
//     <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//       <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
//         <h1 style="color: #ecf0f1; margin: 0;">Fitness Recipe</h1>
//       </div>
//       <div style="padding: 20px;">
//         <p style="font-size: 16px; line-height: 1.5;">
//           Dear Trainer,
//         </p>
//         <p style="font-size: 16px; line-height: 1.5;">
//          Hello (Trainer Name), (Trainee Name) has requested to connect with you on the FitnessTrainer App. Click on the link below to allow them to connect, see your private recipes and also be able to get on your meal plans.

//         </p>
//         <p style="font-size: 16px; line-height: 1.5;">
//           You can reply directly to this email at <a href="mailto:${userEmail}" style="color: #2980b9;">${userEmail}</a>.
//         </p>
//         <p style="font-size: 16px; line-height: 1.5;">
//           Thank you for considering my request.
//         </p>
//         <p style="font-size: 16px; line-height: 1.5;">
//           Best regards.<br>
//         </p>
//       </div>
//       <div style="background-color: #ecf0f1; padding: 10px; text-align: center;">
//         <p style="font-size: 14px; color: #7f8c8d; margin: 0;">&copy; 2024 Fitness Recipe. All rights reserved.</p>
//       </div>
//     </div>
//   </div>
//   `,
//     };

//     await sendEmail(emailData);
//     res.status(200).send("Email sent");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Failed to send email");
//   }
// });

// New mail
router.post("/send-email", async (req, res) => {
  const { to, userEmail } = req.body;

  if (!to || !userEmail) {
    return res.status(400).json({ message: "Invalid email or user email" });
  }

  // Fetch the trainer and trainee details from the database
  const trainer = await getUserByEmail(to);
  const trainee = await getUserByEmail(userEmail);

  if (!trainer) {
    return res.status(404).json({ message: "Trainer not found" });
  }
  if (!trainee) {
    return res.status(404).json({ message: "Trainee does not exist" });
  }

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
               Hello ${trainer.fullName} , ${trainee.fullName} has requested to connect with you on the Fitness Recipe App. Click <span> <a href="mailto:${userEmail}?subject=Request%20Accepted(Fitness%20Recipe)&body=Hi%20${trainee.username},%20I%20accept%20your%20connection%20request.%20My%20code%20is%20${trainer.code}%20and%20my%20username%20is%20${trainer.username}.%20You%20can%20enter%20this%20code%20to%20gain%20access." style="color: #2980b9;font-weight: 700;">accept request</a></span> to connect and allow ${trainee.username} see your private recipes, and also be able to get on your meal plans.
               
              </p>
              
              <p style="font-size: 16px; line-height: 1.5;">
              If you do not wish to connect with the ${trainee.fullName}, click <span><a href="mailto:${userEmail}?subject=Decline%20Request&body=Hi%20${trainee.fullName},%20I%20am%20declining%20your%20connection%20request." style="color: #2980b9;font-weight: 700;">decline here</a>.</span> or simply ignore this email.
              </p>
              
              <!-- First Link: A message to accept the request -->
             
              <p style="font-size: 16px; line-height: 1.5;">
                Thank you for considering this request.
              </p>
              
              <p style="font-size: 16px; line-height: 1.5;">
                Best regards,<br>
                Fitness Recipe Team
              </p>
            </div>
            <div style="background-color: #ecf0f1; padding: 10px; text-align: center;">
              <p style="font-size: 14px; color: #7f8c8d; margin: 0;">&copy; 2024 Fitness Recipe. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send the email with user details included
    await sendEmail(emailData);
    res.status(200).send("Email sent successfully with user details.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send email");
  }
});

// Accept Request Endpoint

router.get("/accept", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  try {
    // Fetch the user details from the database
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Prepare email content with user details
    const subject = "Request Accepted";
    const content = `
      Hi ${user.username},\n\n
      The trainer has accepted your request.\n
      Here are your details:\n
      - Username: ${user.username}\n
      - Code: ${user.code}\n
      - Email: ${user.email}\n\n
      Thank you!
    `;

    // Send the acceptance email
    await sendEmail(user.email, subject, content);

    res.send("Accepted request and sent confirmation email.");
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).send("Error sending email: " + err.message);
  }
});

// Reject Request Endpoint
router.get("/reject", (req, res) => {
  const { email } = req.query;
  const subject = "Request Rejected";
  const content = "The trainer has rejected your request.";

  // Send rejection email
  sendEmail(email, subject, content)
    .then(() => res.send("Rejected request and sent confirmation email"))
    .catch((err) =>
      res.status(500).send("Error sending email: " + err.message)
    );
});

export default router;
