const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadCoverImage,
  uploadOwnerPhoto,
  uploadHeroImage,
  removeHeroImage,
  updateHeroContent,
  updateInstagramGallery,
  getGalleryImages,
  updateStatus,
  updateHours,
  updateContact,
  updateOwner,
  resetSettings,
} = require("../controllers/settingsController");

// @route   GET /api/settings
// @desc    Get restaurant settings
router.get("/", getSettings);

// @route   PUT /api/settings
// @desc    Update restaurant settings
router.put("/", updateSettings);

// @route   POST /api/settings/logo
// @desc    Upload restaurant logo
router.post("/logo", upload.single("image"), uploadLogo);

// @route   POST /api/settings/cover-image
// @desc    Upload restaurant cover image
router.post("/cover-image", upload.single("image"), uploadCoverImage);

// @route   POST /api/settings/owner-photo
// @desc    Upload owner photo
router.post("/owner-photo", upload.single("image"), uploadOwnerPhoto);

// @route   POST /api/settings/hero-image
// @desc    Upload hero section image
router.post("/hero-image", upload.single("image"), uploadHeroImage);

// @route   DELETE /api/settings/hero-image/:index
// @desc    Remove hero section image
router.delete("/hero-image/:index", removeHeroImage);

// @route   PATCH /api/settings/hero-content
// @desc    Update hero section content
router.patch("/hero-content", updateHeroContent);

// @route   PATCH /api/settings/instagram-gallery
// @desc    Update Instagram gallery selection
router.patch("/instagram-gallery", updateInstagramGallery);

// @route   GET /api/settings/gallery-images
// @desc    Get gallery images for selection
router.get("/gallery-images", getGalleryImages);

// @route   PATCH /api/settings/status
// @desc    Update restaurant status (open/closed)
router.patch("/status", updateStatus);

// @route   PATCH /api/settings/hours
// @desc    Update operating hours
router.patch("/hours", updateHours);

// @route   PATCH /api/settings/contact
// @desc    Update contact information
router.patch("/contact", updateContact);

// @route   PATCH /api/settings/owner
// @desc    Update owner information
router.patch("/owner", updateOwner);

// @route   DELETE /api/settings
// @desc    Reset settings to default
router.delete("/", resetSettings);

// @route   PATCH /api/settings/hero-images
// @desc    Update hero section images from gallery selection
router.patch(
  "/hero-images",
  require("../controllers/settingsController").updateHeroImages
);

module.exports = router;
