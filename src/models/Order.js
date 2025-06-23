const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Ready",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    orderTime: {
      type: Date,
      default: Date.now,
    },
    deliveryGuy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("validate", async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Generate a random 8-character alphanumeric string (uppercase)
      const randomString = () =>
        Array.from({ length: 8 }, () => Math.random().toString(36).charAt(2))
          .join("")
          .toUpperCase();
      let unique = false;
      let orderNum;
      // Ensure uniqueness
      while (!unique) {
        orderNum = randomString();
        const exists = await mongoose
          .model("Order")
          .findOne({ orderNumber: orderNum });
        if (!exists) unique = true;
      }
      this.orderNumber = orderNum;
    } catch (error) {
      // Fallback: use timestamp-based random string
      this.orderNumber = (
        Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      ).toUpperCase();
    }
  }
  next();
});

// Virtual for user-friendly display number
orderSchema.virtual("displayOrderNumber").get(function () {
  return `#${this.orderNumber}`;
});

// Virtual for formatted order time
orderSchema.virtual("formattedOrderTime").get(function () {
  return this.orderTime.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Ensure virtual fields are serialized
orderSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
