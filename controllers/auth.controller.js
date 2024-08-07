import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, password, email } = req.body;

    console.log(req.body);
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(hashedPassword);

    // Create a new user
    const user = new User({
      fullName,
      username,
      password: hashedPassword,
      email,
    });

    // Save the user to the database
    await user.save();
    console.log(user);

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, "My-baby-slept", {
      expiresIn: "1h",
    });
    console.log(token);

    res.status(201).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
