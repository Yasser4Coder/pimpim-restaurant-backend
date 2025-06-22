const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login endpoint
router.post("/login", authController.login);
// Refresh token endpoint
router.post("/refresh", authController.refresh);
// Logout endpoint
router.post("/logout", authController.logout);

module.exports = router;
