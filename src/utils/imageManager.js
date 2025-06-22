const { cloudinary } = require("./cloudinary");

/**
 * Safely delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @param {string} imageType - Type of image for logging (e.g., "cover image", "owner photo")
 * @returns {Promise<boolean>} - Returns true if deletion was successful or image didn't exist
 */
const deleteImageFromCloudinary = async (publicId, imageType = "image") => {
  if (!publicId) {
    console.log(`No ${imageType} public ID provided, skipping deletion`);
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      console.log(
        `Successfully deleted ${imageType} from Cloudinary: ${publicId}`
      );
      return true;
    } else {
      console.error(
        `Failed to delete ${imageType} from Cloudinary: ${publicId}`,
        result
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error deleting ${imageType} from Cloudinary: ${publicId}`,
      error
    );
    return false;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} images - Array of objects with publicId and type properties
 * @returns {Promise<Array>} - Returns array of deletion results
 */
const deleteMultipleImages = async (images) => {
  const deletePromises = images.map(({ publicId, type }) =>
    deleteImageFromCloudinary(publicId, type)
  );

  return Promise.allSettled(deletePromises);
};

/**
 * Clean up old images when updating settings
 * @param {Object} oldSettings - Previous settings object
 * @param {Object} newSettings - New settings object
 * @returns {Promise<void>}
 */
const cleanupOldImages = async (oldSettings, newSettings) => {
  const imagesToDelete = [];

  // Check cover image
  if (
    oldSettings.coverImagePublicId &&
    oldSettings.coverImagePublicId !== newSettings.coverImagePublicId
  ) {
    imagesToDelete.push({
      publicId: oldSettings.coverImagePublicId,
      type: "cover image",
    });
  }

  // Check owner photo
  if (
    oldSettings.owner?.photoPublicId &&
    oldSettings.owner.photoPublicId !== newSettings.owner?.photoPublicId
  ) {
    imagesToDelete.push({
      publicId: oldSettings.owner.photoPublicId,
      type: "owner photo",
    });
  }

  if (imagesToDelete.length > 0) {
    console.log(`Cleaning up ${imagesToDelete.length} old images...`);
    await deleteMultipleImages(imagesToDelete);
  }
};

/**
 * Validate image file
 * @param {Object} file - File object from multer
 * @returns {Object} - Validation result with isValid and error properties
 */
const validateImageFile = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 10MB",
    };
  }

  return { isValid: true, error: null };
};

module.exports = {
  deleteImageFromCloudinary,
  deleteMultipleImages,
  cleanupOldImages,
  validateImageFile,
};
