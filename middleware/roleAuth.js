const roleAuth = (roles) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await user.findById(req.user.id);
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Not authorized for this role" });
    }
    next();
  };
};

module.exports = roleAuth;
