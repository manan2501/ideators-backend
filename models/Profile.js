const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  credits: {
    type: Number,
    required: true,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  isBanned: {
    type: Boolean,
    required: true,
    default: false,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkinTime: {
    type: Number,
    required: true,
    deafult: null,
  },
  checkoutTime: {
    type: Number,
    required: true,
    deafult: null,
  },
});

module.exports = mongoose.model("profile", ProfileSchema);
