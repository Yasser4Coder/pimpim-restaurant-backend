import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import foodRouts from "./src/routes/FoodServices.routes.js";
import statusRouts from "./src/routes/Status.routes.js";
import imagesRoutes from "./src/routes/Images.routes.js";
import allowedOrgins from "./src/config/allwedOrgins.js";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
const DB_URL = process.env.MONGODB_URL;

const app = express();

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed list
      if (allowedOrgins.indexOf(origin) === -1) {
        // If the origin is not allowed, return an error
        return callback(new Error("Not allowed by CORS"));
      }

      // If the origin is allowed, proceed
      return callback(null, true);
    },
  })
);
app.use(express.json({ limit: "50mb" })); // Increase to 50mb or as needed
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/foods", foodRouts);
app.use("/img", imagesRoutes);
app.use("/stat", statusRouts);

app.get("/", (req, res) => {
  res.send("working");
});

mongoose
  .connect(DB_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err && "Database connection failed"));

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
