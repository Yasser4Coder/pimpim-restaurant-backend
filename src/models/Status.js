import mongoose from "mongoose";

const StatusSchema = mongoose.Schema({
  id: Number,
  status: Boolean,
  text: String,
});

const Status = mongoose.model("Status", StatusSchema);

export default Status;
