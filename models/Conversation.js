const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  conv_type: { type: String, default: "chat" },

  latest_msg: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: Number
  },

  status: {
    type: String,
    enum: ["open", "assigned", "closed"],
    default: "open"
  }

}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
