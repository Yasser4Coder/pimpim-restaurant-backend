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
      const count = await mongoose.model("Order").countDocuments();
      // Generate without the '#'
      this.orderNumber = String(count + 1).padStart(4, "0");
    } catch (error) {
      // If there's an error, generate a timestamp-based order number
      this.orderNumber = Date.now().toString().slice(-4);
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
