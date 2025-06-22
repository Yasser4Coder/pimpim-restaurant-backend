const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.get("/", auth, userController.getAllUsers);
router.post("/", userController.addUser);
router.delete("/:id", auth, userController.deleteUser);
router.put("/:id", auth, userController.updateUser);
router.patch("/:id/status", auth, userController.changeUserStatus);
router.get("/me", auth, userController.getMe);

module.exports = router;
