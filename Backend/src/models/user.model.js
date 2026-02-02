const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },
    password: {
      type: String,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },

    // This field will hold the expiration date.
    // If it is null (for real users), they are never deleted.
    expireAt: {
      type: Date,
      default: null,
      index: { expires: 0 }, // This tells Mongo: "Delete document when this time is reached"
    },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;