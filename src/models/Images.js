import mongoose from "mongoose";

const ImagesSchema = mongoose.Schema({
  imageUrl: String,
});

const Images = mongoose.model("Images", ImagesSchema);

export default Images;
