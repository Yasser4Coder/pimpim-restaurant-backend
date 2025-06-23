const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const upload = require("../middlewares/upload"); // for Cloudinary upload
const {
  getAllMenus,
  getMenuById,
  addMenu,
  updateMenu,
  deleteMenu,
  getMenuCount,
} = require("../controllers/menuController");

// Routes - put specific routes first, then parameterized routes
router.get("/", getAllMenus);
router.post("/", upload.single("image"), addMenu);
router.get("/count", getMenuCount);
router.get("/:id", getMenuById);
router.put("/:id", upload.single("image"), updateMenu);
router.delete("/:id", deleteMenu);

module.exports = router;
