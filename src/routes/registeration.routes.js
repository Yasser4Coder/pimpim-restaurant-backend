import express from "express";
import {
  newUser,
  getUsers,
  getUserById,
} from "../controllers/registerationControllers.js";

const router = express.Router();

router.post("/newUser", newUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);

export default router;
