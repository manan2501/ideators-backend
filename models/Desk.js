const mongoose = require("mongoose");

const DeskSchema = new mongoose.Schema({
  deskID: {
    type: String,
    required: true,
    unique: true,
  },
  inUse: {
    type: Boolean,
    required: true,
    default: false,
  },
  userUsing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("desk", DeskSchema);
