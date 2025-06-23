const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");

const {
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  createOrder,
  updateOrderStatus,
  assignDeliveryGuy,
  getOrdersByStatus,
  getOrderStats,
  getMyOrders,
  getRecentOrders,
  getTotalRevenue,
  deleteAllOrders,
  getOrderProgress,
} = require("../controllers/orderController");

// Get all orders
router.get("/", getAllOrders);

// Get order statistics (must come before /:id route)
router.get("/stats/overview", getOrderStats);

// Get orders by status (must come before /:id route)
router.get("/status/:status", getOrdersByStatus);

// Track order by order number (must come before /:id route)
router.get("/track/:orderNumber", getOrderByOrderNumber);

// Get orders assigned to the current delivery guy
router.get("/my-orders", auth, getMyOrders);

// Get recent orders (for dashboard)
router.get("/recent", getRecentOrders);

// Get total revenue (for dashboard)
router.get("/revenue", getTotalRevenue);

// Get business progress stats (cumulative, monthly, yearly)
router.get("/progress", getOrderProgress);

// Create a new order
router.post("/", createOrder);

// Delete all orders (for admin bulk delete)
router.delete("/all", deleteAllOrders);

// Get single order by ID (must come after specific routes)
router.get("/:id", validateObjectId, getOrderById);

// Update order status
router.put("/:id/status", validateObjectId, updateOrderStatus);

// Assign delivery guy to order
router.put("/:id/assign-delivery", validateObjectId, assignDeliveryGuy);

module.exports = router;
