import express from "express";
import Status from "../models/Status.js";

const router = express.Router();

// Route to get status data
router.get("/status", async (req, res) => {
  try {
    const statusData = await Status.find();
    res.status(200).json(statusData);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Route to update status data
router.put("/status/:id", async (req, res) => {
  const { id } = req.params;
  const { status, text } = req.body;

  try {
    const updatedStatus = await Status.findByIdAndUpdate(
      id,
      { status, text },
      { new: true } // This option returns the updated document
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json(updatedStatus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
