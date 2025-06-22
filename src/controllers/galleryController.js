const Gallery = require("../models/Gallery");
const { cloudinary } = require("../utils/cloudinary");

// GET all gallery items
exports.getAllImages = async (req, res, next) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
};

// POST a new gallery image
exports.uploadImage = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const url = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary public ID

    const newImage = await Gallery.create({
      url,
      publicId,
      title,
      description,
    });

    res.status(201).json(newImage);
  } catch (error) {
    next(error);
  }
};

// DELETE a gallery image
exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Delete from Cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // Delete from DB
    await image.deleteOne();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};
