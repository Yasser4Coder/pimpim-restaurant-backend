import mongoose from "mongoose";

const FoodSchema = mongoose.Schema({
  name: String,
  price: String,
  favorite: Boolean,
  stars: Number,
  descreption: String,
  imageUrl: String,
  key: String,
  tags: [String],
});

const Foods = mongoose.model("Foods", FoodSchema);

export default Foods;
