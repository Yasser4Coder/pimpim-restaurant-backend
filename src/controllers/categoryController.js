const Category = require("../models/Category");

// @desc Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc Get single category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc Add new category
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const newCategory = await Category.create({ name, status: "active" });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

// @desc Update a category
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, status } = req.body;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc Delete a category
exports.deleteCategory = async (req, res, next) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
