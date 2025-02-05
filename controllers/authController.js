const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
};

//TODO: implement when im bored
exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with role 'admin'
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Set role to 'admin'
    });

    await user.save();

    // Create a JWT token
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
};

exports.instructorSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user && user.role === "instructor")
      return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with role 'instructor'
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: "instructor",
    });

    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { code } = req.body?.code || req.body;

    // Exchange authorization code for tokens

    const { tokens } = await googleClient.getToken(code);

    const idToken = tokens.id_token;

    // Verify ID token (using the access token)
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId, picture } = payload;

    // Check if user exists, else create new user (same as before)
    let user = await User.findOne({ email });

    if (!user) {
      // If role is instructor, set it explicitly, otherwise default to student
      const userData = {
        name,
        email,
        googleId,
        profileImage: picture,
      };

      // Only add role if instructor is specified
      if (role === "instructor") {
        userData.role = "instructor";
      }
      user = new User(userData);
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    res.json({
      name,
      email,
      token: jwtToken,
      profileImage: picture,
      access_token: tokens.access_token,
      role: user.role,
    });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Google Authentication failed", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password reset error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    const userId = req.user.id;

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage; // Update profile image URL

    // Save the updated user data
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

exports.getUser = async (req, res) => {
  try {
    // req.user.id comes from the auth middleware
    const user = await User.findById(req.user.id)
      .select("-password")
      .select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting user" });
  }
};
