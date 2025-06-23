const Menu = require("../models/Menu");
const { cloudinary } = require("../utils/cloudinary");

// Get all menu items
exports.getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find();
    res.status(200).json(menus);
  } catch (error) {
    next(error);
  }
};

// Get a single menu item by ID
exports.getMenuById = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// Add a new menu item
exports.addMenu = async (req, res, next) => {
  try {
    const { name, description, price, category, available, rating } = req.body;

    const image = req.file?.path;
    const publicId = req.file?.filename; // this is safe to use with cloudinary storage

    const menu = await Menu.create({
      name,
      description,
      price,
      category,
      image,
      publicId,
      available,
      rating,
    });

    res.status(201).json(menu);
  } catch (error) {
    next(error);
  }
};

// Update a menu item
exports.updateMenu = async (req, res, next) => {
  try {
    const { name, description, price, category, available, rating } = req.body;
    const image = req.file?.path;

    const updatedData = {
      name,
      description,
      price,
      category,
      available,
      rating,
    };

    if (image) updatedData.image = image;

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedMenu);
  } catch (error) {
    next(error);
  }
};

// Delete a menu item
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Delete image from Cloudinary
    if (menu.publicId) {
      await cloudinary.uploader.destroy(menu.publicId);
    }

    // Delete from DB
    await menu.deleteOne();

    res.status(200).json({ message: "Menu item and image deleted" });
  } catch (error) {
    next(error);
  }
};

// Get menu items count
exports.getMenuCount = async (req, res, next) => {
  try {
    const count = await Menu.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
