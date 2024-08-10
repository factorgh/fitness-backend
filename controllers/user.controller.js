import User from "../models/user.model.js";

export const getMe = async (req, res) => {
  console.log(req.user);
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

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

// unFollow functionality
export const unfollowUser = async (req, res) => {
  try {
    const { userIdToUnfollow } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "1" && user.following.length === 0) {
      return res.status(400).json({
        message: "User with role 1 cannot unfollow any user",
      });
    }

    if (!user.following.includes(userIdToUnfollow)) {
      return res.status(400).json({ message: "User not following this user" });
    }

    user.following = user.following.filter(
      (id) => id.toString() !== userIdToUnfollow
    );
    await user.save();

    res.json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Follow functionality
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

    if (user.role === "1" && user.following.length >= 1) {
      return res.status(400).json({
        message:
          "User with role 1 can only follow one user with role 0 at a time",
      });
    }

    if (user.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    user.following.push(userIdToFollow);
    await user.save();

    res.json({
      message: "User followed successfully",
      following: user.following,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
