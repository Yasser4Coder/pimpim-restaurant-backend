const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  getAllImages,
  uploadImage,
  deleteImage,
} = require("../controllers/galleryController");

// GET all gallery images
router.get("/", getAllImages);

// POST a new image (upload with Cloudinary)
router.post("/", upload.single("image"), uploadImage);

// DELETE an image
router.delete("/:id", deleteImage);

module.exports = router;
