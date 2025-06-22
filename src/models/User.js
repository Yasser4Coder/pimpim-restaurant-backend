const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: Number,
      enum: [1012, 1001], // 1012: admin, 1001: delivery guy
      required: true,
      default: 1001,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "busy"],
      default: "active",
    },
    joinDate: {
      type: Date,
      default: Date.now, // auto-assigns current date if not provided
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // skip if password unchanged

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret.password;
    delete ret._id;

    // Format joinDate
    if (ret.joinDate) {
      ret.joinDate = new Date(ret.joinDate).toISOString().slice(0, 10);
    }
  },
});

module.exports = mongoose.model("User", userSchema);
