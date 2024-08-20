import Images from "../models/Images.js";

export const getImages = async (req, res) => {
  try {
    const imagesData = await Images.find();
    res.status(200).json(imagesData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addImages = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (imageUrl === "null") {
      return res
        .status(400)
        .json({ message: "Some required information is missing" });
    }

    const newImage = new Images({
      imageUrl,
    });

    await newImage.save();
    res.status(200).json({ message: "The image added successfully", imageUrl });
  } catch (error) {
    console.error("Error adding image:", error);
    res.status(500).json({ message: "Error adding image", error });
  }
};
export const deleteImages = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedImage = await Images.findById(id);
    if (!selectedImage) {
      return res.status(404).json({ message: "image not found" });
    }

    await Images.deleteOne({ _id: id });

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
