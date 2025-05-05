import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true, // ✅ ensure required
  },
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  resetToken: String,
  resetTokenExpiry: Date,
});

export default mongoose.model("User", userSchema);
