const Settings = require("../models/Settings");
const { cloudinary } = require("../utils/cloudinary");

// @desc    Get restaurant settings
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const {
      isOpen,
      name,
      coverImage,
      description,
      story,
      owner,
      contact,
      hours,
      currency,
      timezone,
      language,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create({
        name,
        description,
        story,
        owner,
        contact,
        hours,
        isOpen,
        coverImage,
        currency,
        timezone,
        language,
      });
    } else {
      // Update existing settings
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        {
          isOpen,
          name,
          coverImage,
          description,
          story,
          owner,
          contact,
          hours,
          currency,
          timezone,
          language,
        },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload cover image
// @route   POST /api/settings/cover-image
exports.uploadCoverImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Store the old public ID before updating
    const oldPublicId = settings.coverImagePublicId;

    // Update settings with new image
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        coverImage: req.file.path,
        coverImagePublicId: req.file.filename,
      },
      { new: true }
    );

    // Delete old image from Cloudinary if exists
    if (oldPublicId && oldPublicId !== req.file.filename) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`Deleted old cover image from Cloudinary: ${oldPublicId}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete old cover image from Cloudinary: ${oldPublicId}`,
          deleteError
        );
        // Don't fail the upload if deletion fails
      }
    }

    res.status(200).json({
      message: "Cover image uploaded successfully",
      coverImage: settings.coverImage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload owner photo
// @route   POST /api/settings/owner-photo
exports.uploadOwnerPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Store the old public ID before updating
    const oldPublicId = settings.owner.photoPublicId;

    // Update settings with new image
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        "owner.photo": req.file.path,
        "owner.photoPublicId": req.file.filename,
      },
      { new: true }
    );

    // Delete old image from Cloudinary if exists
    if (oldPublicId && oldPublicId !== req.file.filename) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`Deleted old owner photo from Cloudinary: ${oldPublicId}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete old owner photo from Cloudinary: ${oldPublicId}`,
          deleteError
        );
        // Don't fail the upload if deletion fails
      }
    }

    res.status(200).json({
      message: "Owner photo uploaded successfully",
      ownerPhoto: settings.owner.photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant status (open/closed)
// @route   PATCH /api/settings/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { isOpen } = req.body;

    if (typeof isOpen !== "boolean") {
      return res
        .status(400)
        .json({ message: "isOpen must be a boolean value" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { isOpen },
      { new: true }
    );

    res.status(200).json({
      message: `Restaurant is now ${isOpen ? "open" : "closed"}`,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update operating hours
// @route   PATCH /api/settings/hours
exports.updateHours = async (req, res, next) => {
  try {
    const { hours } = req.body;

    if (!hours || typeof hours !== "object") {
      return res.status(400).json({ message: "Hours object is required" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { hours },
      { new: true }
    );

    res.status(200).json({
      message: "Operating hours updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact information
// @route   PATCH /api/settings/contact
exports.updateContact = async (req, res, next) => {
  try {
    const { contact } = req.body;

    if (!contact || typeof contact !== "object") {
      return res.status(400).json({ message: "Contact object is required" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { contact },
      { new: true }
    );

    res.status(200).json({
      message: "Contact information updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update owner information
// @route   PATCH /api/settings/owner
exports.updateOwner = async (req, res, next) => {
  try {
    const { owner } = req.body;

    if (!owner || typeof owner !== "object") {
      return res.status(400).json({ message: "Owner object is required" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { owner },
      { new: true }
    );

    res.status(200).json({
      message: "Owner information updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset settings to default
// @route   DELETE /api/settings
exports.resetSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Clean up images from Cloudinary
    const { cloudinary } = require("../utils/cloudinary");

    // Clean up logo
    if (settings.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.logoPublicId);
      } catch (error) {
        console.error("Error deleting logo from Cloudinary:", error);
      }
    }

    // Clean up cover image
    if (settings.coverImagePublicId) {
      try {
        await cloudinary.uploader.destroy(settings.coverImagePublicId);
      } catch (error) {
        console.error("Error deleting cover image from Cloudinary:", error);
      }
    }

    // Clean up owner photo
    if (settings.owner.photoPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.owner.photoPublicId);
      } catch (error) {
        console.error("Error deleting owner photo from Cloudinary:", error);
      }
    }

    // Clean up hero images
    if (settings.landingPage?.heroSection?.images) {
      for (const imageUrl of settings.landingPage.heroSection.images) {
        try {
          // Extract public ID from Cloudinary URL
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting hero image from Cloudinary:", error);
        }
      }
    }

    // Delete the settings document
    await settings.deleteOne();

    // Create new default settings
    const newSettings = await Settings.create({
      name: "Delicious Bites Restaurant",
      description:
        "Welcome to Delicious Bites, where culinary excellence meets warm hospitality.",
      story:
        "Founded by Chef Maria Rodriguez in 2010, Delicious Bites started as a small family kitchen with big dreams.",
      owner: {
        name: "Maria Rodriguez",
        bio: "With over 20 years of culinary experience, I believe that food is more than sustenance—it's a way to connect hearts and create lasting memories.",
        title: "Head Chef & Owner",
      },
      contact: {
        phone: "+1 (555) 123-4567",
        email: "info@deliciousbites.com",
        website: "www.deliciousbites.com",
        address: "123 Culinary Street, Food District, City 12345",
      },
    });

    res.status(200).json({
      message: "Settings reset successfully",
      settings: newSettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload restaurant logo
// @route   POST /api/settings/logo
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Store the old public ID before updating
    const oldPublicId = settings.logoPublicId;

    // Update settings with new logo
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        logo: req.file.path,
        logoPublicId: req.file.filename,
      },
      { new: true }
    );

    // Delete old logo from Cloudinary if exists
    if (oldPublicId && oldPublicId !== req.file.filename) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`Deleted old logo from Cloudinary: ${oldPublicId}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete old logo from Cloudinary: ${oldPublicId}`,
          deleteError
        );
        // Don't fail the upload if deletion fails
      }
    }

    res.status(200).json({
      message: "Logo uploaded successfully",
      logo: settings.logo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload hero section image
// @route   POST /api/settings/hero-image
exports.uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Add new image to hero section
    const updatedImages = [
      ...(settings.landingPage?.heroSection?.images || []),
      req.file.path,
    ];

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        "landingPage.heroSection.images": updatedImages,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Hero image uploaded successfully",
      heroImages: settings.landingPage.heroSection.images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove hero section image
// @route   DELETE /api/settings/hero-image/:index
exports.removeHeroImage = async (req, res, next) => {
  try {
    const { index } = req.params;
    const imageIndex = parseInt(index);

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const currentImages = settings.landingPage?.heroSection?.images || [];
    if (imageIndex < 0 || imageIndex >= currentImages.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    // Remove image at specified index
    const updatedImages = currentImages.filter((_, i) => i !== imageIndex);

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        "landingPage.heroSection.images": updatedImages,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Hero image removed successfully",
      heroImages: settings.landingPage.heroSection.images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hero section content
// @route   PATCH /api/settings/hero-content
exports.updateHeroContent = async (req, res, next) => {
  try {
    const { title, subtitle, description } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings = await Settings.findByIdAndUpdate(
      settings._id,
      {
        "landingPage.heroSection.title": title,
        "landingPage.heroSection.subtitle": subtitle,
        "landingPage.heroSection.description": description,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Hero content updated successfully",
      heroSection: settings.landingPage.heroSection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Instagram gallery selection
// @route   PATCH /api/settings/instagram-gallery
exports.updateInstagramGallery = async (req, res, next) => {
  try {
    const { selectedImages, title, subtitle, maxImages } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const updateData = {};
    if (selectedImages !== undefined)
      updateData["landingPage.instagramGallery.selectedImages"] =
        selectedImages;
    if (title !== undefined)
      updateData["landingPage.instagramGallery.title"] = title;
    if (subtitle !== undefined)
      updateData["landingPage.instagramGallery.subtitle"] = subtitle;
    if (maxImages !== undefined)
      updateData["landingPage.instagramGallery.maxImages"] = maxImages;

    settings = await Settings.findByIdAndUpdate(settings._id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "Instagram gallery updated successfully",
      instagramGallery: settings.landingPage.instagramGallery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get gallery images for selection
// @route   GET /api/settings/gallery-images
exports.getGalleryImages = async (req, res, next) => {
  try {
    const Gallery = require("../models/Gallery");
    const images = await Gallery.find().sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
};

// @desc    Update hero section images from gallery selection
// @route   PATCH /api/settings/hero-images
exports.updateHeroImages = async (req, res, next) => {
  try {
    const { images } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      { "landingPage.heroSection.images": images },
      { new: true }
    );
    res.status(200).json({
      message: "Hero images updated successfully",
      heroImages: settings.landingPage.heroSection.images,
    });
  } catch (error) {
    next(error);
  }
};
