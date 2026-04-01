const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "sender_model"
  },
  sender_model: {
    type: String,
    required: true,
    enum: ["User", "Admin"]
  },

  // Optional but useful for quick checks
  sender_role: {
    type: String,
    enum: ["user", "admin"],
    required: true
  },

  message: String,

  msg_type: {
    type: String,
    enum: ["text", "file"],
    default: "text"
  },

  file_url: String,

  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  },
  timestamp: {
    type: Number,
    default: () => Date.now()
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
