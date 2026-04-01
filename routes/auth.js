const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔑 Generate JWT
// 🔑 Generate JWT using env secret
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
// Signup
router.post("/signup", async (req, res) => {
    const { email, password, name, phone } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "Email already exists" });

        user = new User({ email, password, name, phone });
        await user.save();

        const token = generateToken(user);

        const userSafe = user.toObject(); // convert Mongoose doc to plain object
        delete userSafe.password;         // remove password

        res.status(201).json({
            msg: "User registered successfully",
            user: userSafe,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = generateToken(user);

        const userSafe = user.toObject();
        delete userSafe.password;

        res.json({
            msg: "Login successful",
            user: userSafe,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
});




module.exports = router;