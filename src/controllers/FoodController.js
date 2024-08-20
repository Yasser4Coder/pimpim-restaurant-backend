import Foods from "../models/Foods.js";
import Tags from "../models/Tags.js";

export const getAllFoods = async (req, res) => {
  try {
    const foodsData = await Foods.find();
    res.status(200).json(foodsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addFood = async (req, res) => {
  try {
    const { name, price, stars, description, tag, imageUrl } = req.body;

    if (imageUrl === "null") {
      return res
        .status(400)
        .json({ message: "Some required information is missing" });
    }
    if (!name || !price || !tag) {
      return res
        .status(400)
        .json({ message: "Some required information is missing" });
    }

    // Check if the provided tag exists in the database
    let existingTag = await Tags.findOne({ name: tag });

    if (existingTag) {
      // Increment the count if the tag exists
      existingTag.count += 1;
      await existingTag.save();
    } else {
      // Create a new tag with a count of 1 if it doesn't exist
      const newTag = new Tags({ name: tag, count: 1 });
      await newTag.save();
    }

    // Increment the count of the "All" tag
    let allTag = await Tags.findOne({ name: "All" });

    if (allTag) {
      allTag.count += 1;
      await allTag.save();
    } else {
      // Create the "All" tag if it doesn't exist
      allTag = new Tags({ name: "All", count: 1 });
      await allTag.save();
    }

    const newFood = new Foods({
      name,
      price,
      stars,
      favorite: false,
      description,
      imageUrl,
      tags: tag ? [tag] : [],
    });

    await newFood.save();
    res.status(200).json({ message: "Food added successfully", imageUrl });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ message: "Error adding food", error });
  }
};

export const getTags = async (req, res) => {
  try {
    const tagsData = await Tags.find();
    res.status(200).json(tagsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFoodById = async (req, res) => {
  const { id } = req.params;
  try {
    const spesificFood = await Foods.findById(id);
    if (!spesificFood) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json(spesificFood);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const filterByTag = async (req, res) => {
  const { tag } = req.params;
  try {
    const selectedFoods = await Foods.find({ tags: tag });
    res.status(200).json(selectedFoods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const search = async (req, res) => {
  const { searchTerm } = req.params;
  try {
    const selectedFoods = await Foods.find({
      name: { $regex: searchTerm, $options: "i" },
    });
    res.status(200).json(selectedFoods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFood = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedFood = await Foods.findById(id);
    if (!selectedFood) {
      return res.status(404).json({ message: "Food not found" });
    }

    const alltag = await Tags.findOne({ name: "All" });
    if (alltag && alltag.count > 0) {
      alltag.count -= 1;
      await alltag.save();
    }

    const selectedtag = await Tags.findOne({ name: selectedFood.tags[0] });
    if (selectedtag && selectedtag.count > 0) {
      selectedtag.count -= 1;
      await selectedtag.save();
    }

    if (selectedtag && selectedtag.count == 0) {
      await Tags.deleteOne({ name: selectedFood.tags[0] });
    }

    await Foods.deleteOne({ _id: id });

    res.status(200).json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
