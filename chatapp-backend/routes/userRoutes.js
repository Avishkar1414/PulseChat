import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Get Logged-in User Info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Users Except the Logged-in User
router.get("/all/:currentUserId", authMiddleware, async (req, res) => {
  try {
    const { currentUserId } = req.params;
    const users = await User.find({ _id: { $ne: currentUserId } }).select("name email _id");
    if (users.length === 0) return res.status(404).json({ message: "No users found" });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Multer setup for profile pic
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Profile Picture Upload
router.post("/uploadProfilePic", upload.single("profilePic"), async (req, res) => {
  try {
    const { userId } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: imageUrl }, { new: true });
    res.status(200).json({ message: "Profile picture updated!", profilePic: updatedUser.profilePic });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Profile pic upload failed" });
  }
});

export default router;
