const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await User.findById(decoded.id).select(
        "-password"
      );

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

const candidateOnly = (req, res, next) => {
  if (req.user?.role !== "candidate") {
    return res.status(403).json({
      success: false,
      message: "Candidate access required",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  candidateOnly,
};