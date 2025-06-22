const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");

const {
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  createOrder,
  updateOrderStatus,
  assignDeliveryGuy,
  getOrdersByStatus,
  getOrderStats,
} = require("../controllers/orderController");

// Get all orders
router.get("/", getAllOrders);

// Get order statistics (must come before /:id route)
router.get("/stats/overview", getOrderStats);

// Get orders by status (must come before /:id route)
router.get("/status/:status", getOrdersByStatus);

// Track order by order number (must come before /:id route)
router.get("/track/:orderNumber", getOrderByOrderNumber);

// Create a new order
router.post("/", createOrder);

// Get single order by ID (must come after specific routes)
router.get("/:id", validateObjectId, getOrderById);

// Update order status
router.put("/:id/status", validateObjectId, updateOrderStatus);

// Assign delivery guy to order
router.put("/:id/assign-delivery", validateObjectId, assignDeliveryGuy);

module.exports = router;
