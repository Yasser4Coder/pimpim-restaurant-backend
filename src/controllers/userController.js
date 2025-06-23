const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new delivery guy
// @route   POST /api/users
exports.addUser = async (req, res, next) => {
  try {
    // Only admin can create delivery guy
    if (!req.user || req.user.role !== 1012) {
      return res
        .status(403)
        .json({ message: "Only admin can create delivery guy accounts" });
    }
    const { fullName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 1001, // delivery guy
      status: "active",
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user info
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user status (activate or deactivate)
// @route   PATCH /api/users/:id/status
exports.changeUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or 'inactive'

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User is now ${status}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user info
// @route   GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Get count of active delivery staff
exports.getDeliveryStaffCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments({ role: 1001, status: "active" });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
