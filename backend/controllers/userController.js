const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get Logged-in User Profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile (Name & Email)
const updateProfile = async (req, res) => {
    console.log("hi");
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile, updatePassword };
