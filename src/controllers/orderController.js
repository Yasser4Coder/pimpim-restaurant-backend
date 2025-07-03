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

    // --- Progress update if created as Delivered ---
    if (order.status === "Delivered") {
      const settings = await Settings.findOne();
      if (settings) {
        settings.cumulativeRevenue += order.total;
        settings.cumulativeOrders += 1;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let monthStat = settings.monthlyStats.find(
          (s) => s.year === year && s.month === month
        );
        if (!monthStat) {
          monthStat = { year, month, revenue: 0, orders: 0 };
          settings.monthlyStats.push(monthStat);
        }
        monthStat.revenue += order.total;
        monthStat.orders += 1;
        let yearStat = settings.yearlyStats.find((s) => s.year === year);
        if (!yearStat) {
          yearStat = { year, revenue: 0, orders: 0 };
          settings.yearlyStats.push(yearStat);
        }
        yearStat.revenue += order.total;
        yearStat.orders += 1;
        await settings.save();
      }
    }

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

    const order = await Order.findById(req.params.id);
    const prevStatus = order.status;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("deliveryGuy", "fullName");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If delivered, set delivery guy to active
    if (status === "Delivered" && updatedOrder.deliveryGuy) {
      await User.findByIdAndUpdate(updatedOrder.deliveryGuy._id, {
        status: "active",
      });
    }

    // If status changed to Delivered (and wasn't already Delivered), update stats
    if (status === "Delivered" && prevStatus !== "Delivered") {
      const settings = await Settings.findOne();
      if (settings) {
        // Update cumulative
        settings.cumulativeRevenue += updatedOrder.total;
        settings.cumulativeOrders += 1;
        // Update monthly
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-12
        let monthStat = settings.monthlyStats.find(
          (s) => s.year === year && s.month === month
        );
        if (!monthStat) {
          monthStat = { year, month, revenue: 0, orders: 0 };
          settings.monthlyStats.push(monthStat);
        }
        monthStat.revenue += updatedOrder.total;
        monthStat.orders += 1;
        // Update yearly
        let yearStat = settings.yearlyStats.find((s) => s.year === year);
        if (!yearStat) {
          yearStat = { year, revenue: 0, orders: 0 };
          settings.yearlyStats.push(yearStat);
        }
        yearStat.revenue += updatedOrder.total;
        yearStat.orders += 1;
        await settings.save();
      }
    }

    // Emit socket event for updated order
    getIO().emit("orderUpdated", updatedOrder);

    res.status(200).json(updatedOrder);
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

// @desc    Get recent orders (last 4)
// @route   GET /api/orders/recent
exports.getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("deliveryGuy", "fullName")
      .populate("items.menuItem", "name image")
      .sort({ createdAt: -1 })
      .limit(4);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get total revenue
// @route   GET /api/orders/revenue
exports.getTotalRevenue = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const totalRevenue = result[0]?.totalRevenue || 0;
    res.status(200).json({ totalRevenue });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all orders
// @route   DELETE /api/orders/all
exports.deleteAllOrders = async (req, res, next) => {
  try {
    await Order.deleteMany({});
    res.status(200).json({ message: "All orders deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get business progress stats
// @route   GET /api/orders/progress
exports.getOrderProgress = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json({
      cumulativeRevenue: settings.cumulativeRevenue,
      cumulativeOrders: settings.cumulativeOrders,
      monthlyStats: settings.monthlyStats,
      yearlyStats: settings.yearlyStats,
    });
  } catch (error) {
    next(error);
  }
};
