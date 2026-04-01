require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");
const User = require("../models/User");
const conversation = require("../models/conversation");
const message = require("../models/message");

const generateToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );


// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password, name });

    const token = generateToken(admin);

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json({
      success: true,
      token,
      admin: adminObj
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json({
      success: true,
      token,
      admin: adminObj
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all users (without password)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      data: users
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// ✅ Get all conversations (with user info)
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await conversation.find()
      .populate("user", "-password")
      .populate("admin", "-password");
    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all messages for a conversation
router.get("/conversation/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await message.find({ conversation_id: id })
      .populate("sender", "-password")
      .sort({ createdAt: 1 }); // oldest first
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/create-conversation", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "UserId required" });

    // Find or create conversation
    let convo = await conversation.findOne({ user: userId });
    if (!convo) {
      convo = await conversation.create({ user: userId });
    }

    // Fetch all messages for this conversation
    const messages = await message.find({ conversation_id: convo._id }) // <-- fixed
      .populate("sender")  // refPath handles User/Admin
      .sort({ createdAt: 1 });

    res.json({ success: true, conversation: convo, messages });
    
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Send message as admin
router.post("/conversation/:id/message", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    const convo = await conversation.findById(id);
    if (!convo) return res.status(404).json({ success: false, message: "Conversation not found" });

    const msg = await message.create({
      conversation_id: id,
      sender: convo.admin || null, // assign admin if needed
      sender_role: "admin",
      message: text,
    });

    // Update latest message in conversation
    convo.latest_msg = {
      text,
      sender: msg.sender,
      timestamp: Date.now(),
    };
    await convo.save();

    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;