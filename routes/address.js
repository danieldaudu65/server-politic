// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const message = require("../models/message");
const conversation = require("../models/conversation");

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// Update user address
router.post("/address", auth, async (req, res) => {
  const { street, lga, state } = req.body;

  if (!street || !lga || !state) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.street = street;
    user.lga = lga;
    user.state = state;

    await user.save();

    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({ msg: "Address updated successfully", user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



// Get all messages for a user (user + admin)
router.get("/messages", auth, async (req, res) => {
  try {
    const messages = await message.find({
      $or: [
        { sender_id: req.userId }, // messages sent by user
        { recipient_id: req.userId }, // messages sent to user (from admin)
      ],
    })
      .populate("sender", "-password")
      .sort({ timestamp: 1 }); // oldest first

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// Get or create conversation with admin
router.post("/get-or-create-admin", auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if a conversation between this user and admin exists
    let conversationM = await conversation.findOne({
      participants: { $all: [userId, "admin"] }, // "admin" is a fixed identifier
    });

    // If not, create a new conversation
    if (!conversationM) {
      conversationM = await conversation.create({
        participants: [userId, "admin"],
        latest_msg: { text: "", sender: null, timestamp: Date.now() },
      });
    }

    res.json({ success: true, conversation: conversationM });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;