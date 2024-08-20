import express from "express";
import {
  addFood,
  deleteFood,
  filterByTag,
  getAllFoods,
  getFoodById,
  getTags,
  search,
} from "../controllers/FoodController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/getfoods", getAllFoods);
router.post("/addfood", upload.single("image"), addFood);
router.get("/gettags", getTags);
router.get("/getfoodsbyid/:id", getFoodById);
router.get("/filterbytag/:tag", filterByTag);
router.get("/filterbysearchterm/:searchTerm", search);
router.delete("/delete/:id", deleteFood);

export default router;
