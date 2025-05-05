import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("Received Token:", token); // Debugging
  console.log("JWT Secret Key:", process.env.JWT_SECRET); // Debugging

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No Token Provided." });
  }

  try {
    const tokenValue = token.split(" ")[1]; // Extract after 'Bearer'
    console.log("Extracted Token:", tokenValue); // Debugging

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT Error:", error.message); // Log the actual error
    res.status(400).json({ message: "Invalid Token" });
  }
};

export default authMiddleware;
