const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const upload = require("../middlewares/upload"); // for Cloudinary upload

// Routes - put specific routes first, then parameterized routes
router.get("/", menuController.getAllMenus);
router.post("/", upload.single("image"), menuController.addMenu);
router.get("/:id", menuController.getMenuById);
router.put("/:id", upload.single("image"), menuController.updateMenu);
router.delete("/:id", menuController.deleteMenu);

module.exports = router;
