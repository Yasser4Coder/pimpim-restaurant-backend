const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Restaurant Status
    isOpen: {
      type: Boolean,
      default: true,
    },

    // Restaurant Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    logoPublicId: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    story: {
      type: String,
      required: true,
      trim: true,
    },

    // Landing Page Images
    landingPage: {
      heroSection: {
        images: [
          {
            type: String,
            default: [],
          },
        ],
        title: {
          type: String,
          default: "Welcome to Our Restaurant",
        },
        subtitle: {
          type: String,
          default: "Experience the finest dining in town",
        },
        description: {
          type: String,
          default: "Discover our amazing menu and exceptional service",
        },
      },
      instagramGallery: {
        selectedImages: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gallery",
            default: [],
          },
        ],
        title: {
          type: String,
          default: "Instagram Gallery",
        },
        subtitle: {
          type: String,
          default: "Follow us on Instagram",
        },
        maxImages: {
          type: Number,
          default: 6,
        },
      },
    },

    // Owner Information
    owner: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      photo: {
        type: String,
        default: "",
      },
      photoPublicId: {
        type: String,
        default: "",
      },
      bio: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Contact Information
    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      supportPhone: {
        type: String,
        trim: true,
        default: "",
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      website: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Operating Hours
    hours: {
      monday: {
        open: {
          type: String,
          default: "11:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      tuesday: {
        open: {
          type: String,
          default: "11:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      wednesday: {
        open: {
          type: String,
          default: "11:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      thursday: {
        open: {
          type: String,
          default: "11:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      friday: {
        open: {
          type: String,
          default: "11:00",
        },
        close: {
          type: String,
          default: "23:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      saturday: {
        open: {
          type: String,
          default: "10:00",
        },
        close: {
          type: String,
          default: "23:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
      sunday: {
        open: {
          type: String,
          default: "10:00",
        },
        close: {
          type: String,
          default: "21:00",
        },
        closed: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Additional Settings
    currency: {
      type: String,
      default: "USD",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    language: {
      type: String,
      default: "en",
    },

    // --- Business Progress Tracking ---
    cumulativeRevenue: {
      type: Number,
      default: 0,
    },
    cumulativeOrders: {
      type: Number,
      default: 0,
    },
    monthlyStats: [
      {
        year: Number, // e.g., 2024
        month: Number, // 1-12
        revenue: { type: Number, default: 0 },
        orders: { type: Number, default: 0 },
      },
    ],
    yearlyStats: [
      {
        year: Number, // e.g., 2024
        revenue: { type: Number, default: 0 },
        orders: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      name: "Delicious Bites Restaurant",
      description:
        "Welcome to Delicious Bites, where culinary excellence meets warm hospitality.",
      story:
        "Founded by Chef Maria Rodriguez in 2010, Delicious Bites started as a small family kitchen with big dreams.",
      owner: {
        name: "Maria Rodriguez",
        bio: "With over 20 years of culinary experience, I believe that food is more than sustenance—it's a way to connect hearts and create lasting memories.",
        title: "Head Chef & Owner",
      },
      contact: {
        phone: "+1 (555) 123-4567",
        supportPhone: "0666554488",
        email: "info@deliciousbites.com",
        website: "www.deliciousbites.com",
        address: "123 Culinary Street, Food District, City 12345",
      },
    });
  }
  return settings;
};

settingsSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
