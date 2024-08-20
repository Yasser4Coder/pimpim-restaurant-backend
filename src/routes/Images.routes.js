import express from "express";
import {
  addImages,
  deleteImages,
  getImages,
} from "../controllers/ImagesController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/images", getImages);
router.post("/images", upload.single("image"), addImages);
router.delete("/images/:id", deleteImages);

export default router;
