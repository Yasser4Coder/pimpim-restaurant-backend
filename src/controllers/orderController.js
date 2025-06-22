const Order = require("../models/Order");
const Menu = require("../models/Menu");
const Settings = require("../models/Settings");
const { getIO } = require("../socket");
const mongoose = require("mongoose");
const User = require("../models/User");

// @desc    Get all orders
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("deliveryGuy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("deliveryGuy", "fullName")
      .populate("items.menuItem", "name image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, notes } = req.body;

    // Check if restaurant is open
    const settings = await Settings.findOne();
    if (!settings || !settings.isOpen) {
      return res.status(403).json({
        message:
          "Le restaurant est actuellement fermé. Impossible de passer une commande.",
      });
    }

    // Validate items and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({
          message: `Menu item with ID ${item.menuItem} not found`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          message: `Menu item "${menuItem.name}" is not available`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      validatedItems.push({
        menuItem: item.menuItem,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    const order = await Order.create({
      customer,
      items: validatedItems,
      total,
      notes,
    });

    const populatedOrder = await Order.findById(order._id).populate(
      "deliveryGuy",
      "fullName"
    );

    // Emit socket event for new order
    getIO().emit("newOrder", populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Preparing",
      "Ready",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("deliveryGuy", "fullName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If delivered, set delivery guy to active
    if (status === "Delivered" && order.deliveryGuy) {
      await User.findByIdAndUpdate(order.deliveryGuy._id, { status: "active" });
    }

    // Emit socket event for updated order
    getIO().emit("orderUpdated", order);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery guy to order
// @route   PUT /api/orders/:id/assign-delivery
exports.assignDeliveryGuy = async (req, res, next) => {
  try {
    const { deliveryGuyId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(deliveryGuyId)) {
      return res
        .status(400)
        .json({ message: "Invalid deliveryGuyId: must be a MongoDB ObjectId" });
    }
    // Check if delivery guy is active
    const deliveryGuy = await User.findById(deliveryGuyId);
    if (!deliveryGuy || deliveryGuy.status !== "active") {
      return res
        .status(400)
        .json({ message: "Delivery guy is not available for assignment" });
    }
    // Set delivery guy to busy
    await User.findByIdAndUpdate(deliveryGuyId, { status: "busy" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        deliveryGuy: deliveryGuyId,
        status: "Out for Delivery", // Automatically update status when assigning delivery
      },
      { new: true, runValidators: true }
    ).populate("deliveryGuy", "fullName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit socket event for updated order
    getIO().emit("orderUpdated", order);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders by status
// @route   GET /api/orders/status/:status
exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    const validStatuses = [
      "Pending",
      "Preparing",
      "Ready",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const orders = await Order.find({ status })
      .populate("deliveryGuy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      Pending: 0,
      Preparing: 0,
      Ready: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json(statusCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by order number for tracking
// @route   GET /api/orders/track/:orderNumber
exports.getOrderByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    // Remove # if present in the order number
    const cleanOrderNumber = orderNumber.replace("#", "");

    const order = await Order.findOne({ orderNumber: cleanOrderNumber })
      .populate("deliveryGuy", "fullName")
      .populate("items.menuItem", "name image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders assigned to the current delivery guy
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 1001) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const orders = await Order.find({ deliveryGuy: req.user.id })
      .populate("deliveryGuy", "fullName")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
