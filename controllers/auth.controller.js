import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Register a new user

const generateUniqueCode = (fullName) => {
  // Extract first and last letters of the full name
  const firstLetter = fullName.charAt(0).toUpperCase();
  const lastLetter = fullName.charAt(fullName.length - 1).toUpperCase();

  // Generate 5 random digits
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits

  // Combine into the final code
  return `${firstLetter}${randomDigits}${lastLetter}`;
};
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, password, email } = req.body;

    console.log(req.body);
    // Check if a user with the same email already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists; check if the details match
      if (user.fullName === fullName && user.username === username) {
        // Update the user's details
        if (password) {
          user.password = await bcrypt.hash(password, 12); // Update password if provided
        }
        user.code = generateUniqueCode(fullName); // Generate a new code

        // Save the updated user to the database
        await user.save();
      } else {
        // User exists but details don't match; return an error
        return res.status(400).json({ message: "User details do not match" });
      }
    } else {
      // User does not exist; create a new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const uniqueCode = generateUniqueCode(fullName);

      user = new User({
        fullName,
        username,
        password: hashedPassword,
        email,
        code: uniqueCode,
      });

      // Save the user to the database
      await user.save();
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "90d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the user has role "0" and is following someone
    if (user.role === "0" && user.following.length === 0) {
      return res.status(403).json({
        message: "User must be following at least one trainer to log in.",
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "90d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Change password fuctionalaity
export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    // Update user password
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot password coming soon
