const mongoose = require("mongoose");

const User = mongoose.models.User || require("../models/user");
const roleAuth = (roles) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  };
};

module.exports = roleAuth;
