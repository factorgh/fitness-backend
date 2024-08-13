import User from "../models/user.model.js";

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
    const user = await User.findById(req.user._id);
    const userToFollow = await User.findById(userIdToFollow);

    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }
    if (user.role === "1" && userToFollow.role === "1") {
      return res.status(400).json({
        message: "User with role 1 cannot follow another user with role 1",
      });
    }
    if (user.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: "Already following this user" });
    }
    user.following.push(userIdToFollow);
    await user.save();
    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userIdToUnfollow } = req.body;
    const user = await User.findById(req.user._id);

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
    const trainer = await User.findById(req.params.trainerId).populate(
      "followers"
    );
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
    const trainer = await User.findById(req.params.trainerId).populate(
      "following"
    );
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
