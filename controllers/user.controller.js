import User from "../models/user.model.js";
import mongoose from "mongoose";

// Fetch the current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "savedRecipes mealPlans"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "savedRecipes mealPlans"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get trainees following a specific trainer
export const getTrainerTrainees = async (req, res) => {
  try {
    // Get the trainers id from the request params
    const trainer = await User.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    if (trainer.role !== "1") {
      return res.status(400).json({ message: "Invalid trainer role" });
    }
    const trainees = await User.find({
      _id: { $in: trainer.followers },
      role: "0",
    });
    res.json(trainees);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Get all trainers
export const getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: "1" });
    if (trainers.length === 0) {
      return res.status(404).json({ message: "No trainers found" });
    }
    res.json(trainers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Follow a user

export const followUser = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currentUserId = req.user.id;

    // Validate userIdToFollow
    if (!mongoose.Types.ObjectId.isValid(userIdToFollow)) {
      return res.status(400).json({ message: "Invalid user ID to follow" });
    }

    const user = await User.findById(currentUserId);
    const userToFollow = await User.findById(userIdToFollow);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    // Role validation
    if (user.role === "0" && userToFollow.role === "0") {
      return res.status(400).json({
        message: "User with role 1 cannot follow another user with role 1",
      });
    }

    // Check if already following
    if (user.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following and followers lists
    user.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    // Save changes
    await user.save();
    await userToFollow.save(); // Ensure you save the user being followed

    res.json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Error in followUser:", error); // Add logging for debugging
    res.status(400).json({ error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userIdToUnfollow } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.following.includes(userIdToUnfollow)) {
      return res.status(400).json({ message: "Not following this user" });
    }
    user.following = user.following.filter(
      (id) => id.toString() !== userIdToUnfollow
    );
    await user.save();
    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get followers of a trainer
export const getFollowers = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.trainerId)
      .populate("followers")
      .select("fullName username imageUrl");
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json(trainer.followers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get trainers followed by a specific trainer
export const getFollowingTrainers = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.trainerId)
      .populate("following")
      .select("fullName username imageUrl");
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json(trainer.following);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const searchTrainer = async (req, res) => {
  try {
    const { query } = req.query;

    // Basic text search in fullName and specialties
    const trainers = await User.find({
      role: 1,
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    }).select("fullName username imageUrl"); // Specify fields to include

    res.json(trainers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get details(name,id,imageUrl) of a list of traineees

export const traineesDetails = async (req, res) => {
  try {
    const { traineeIds } = req.body;

    // Fetch trainee details from the database
    const trainees = await User.find({
      _id: { $in: traineeIds },
    }).select("id fullName username imageUrl"); // Select only the fields you need

    res.status(200).json({ trainees });
  } catch (error) {
    console.error("Error fetching trainee details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTrainerByCode = async (req, res) => {
  try {
    const { code } = req.params; // Assume code is passed as a URL parameter

    // Find the user by code with role 1
    const user = await User.findOne({ code, role: 1 }).select(
      "fullName username imageUrl"
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or does not have the required role" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get 10 top rated trainers
export const getTopTrainers = async (req, res) => {
  try {
    const topTrainers = await User.aggregate([
      // Match users with the role of "1" (trainers)
      {
        $match: { role: "1" },
      },
      //  Add a field for the number of followers
      {
        $addFields: { followersCount: { $size: "$followers" } },
      },
      //  Sort by the number of followers in descending order
      {
        $sort: { followersCount: -1 },
      },
      //  Limit to the top 10 trainers
      {
        $limit: 10,
      },
      //  Return only the required fields
      {
        $project: {
          fullName: 1,
          username: 1,
          imageUrl: 1,
          followersCount: 1,
        },
      },
    ]);

    res.json(topTrainers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
