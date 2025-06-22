const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const menuRoutes = require("./menuRoutes");
const categoryRoutes = require("./categoryRoutes");
const galleryRoutes = require("./galleryRoutes");
const orderRoutes = require("./orderRoutes");
const settingsRoutes = require("./settingsRoutes");
const authRoutes = require("./authRoutes");

router.use("/users", userRoutes);
router.use("/menu", menuRoutes);
router.use("/categorys", categoryRoutes);
router.use("/gallery", galleryRoutes);
router.use("/orders", orderRoutes);
router.use("/settings", settingsRoutes);
router.use("/auth", authRoutes);

module.exports = router;
