import mongoose from "mongoose";

const TagsSchema = mongoose.Schema({
  name: String,
  count: Number,
});

const Tags = mongoose.model("Tags", TagsSchema);

export default Tags;
