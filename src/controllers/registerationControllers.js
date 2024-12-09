import User from "../models/User.js";

export const newUser = async (req, res) => {
  try {
    const { fisrtName, lastName, email, password } = req.body;

    if (email === "null") {
      return res
        .status(400)
        .json({ message: "Some required information is missing" });
    }

    const newUser = new User({
      fisrtName,
      lastName,
      email,
      password,
      role: 1012,
    });

    await newUser.save();
    res.status(200).json({ message: "user added successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Error adding user", error });
  }
};

export const getUsers = async (req, res) => {
  try {
    const usersData = await User.find();
    res.status(200).json(usersData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
