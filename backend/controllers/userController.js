import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const registerSuperAdmin = async (req, res) => {
  try {
    console.log("User req", req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const newSuperAdmin = new User({
      name,
      email,
      password,
      role: "superadmin",
      isVerified: false,
      verificationToken: token,
    });
    await newSuperAdmin.save();
    res.status(201).json({ message: "SuperAdmin registered successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const registerManager = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    // Check if all fields are
    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // seprate company check parxa kinai no idea
    const existing = await User.findOne({ email }); //
    if (existing) {
      return res.status(400).json({ message: " Manager already exists" });
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create token for verification
    const token = crypto.randomBytes(32).toString("hex"); // Generate a random token
    //create manager
    const newManager = new User({
      name,
      email,
      // password: hashedPassword, // not necessary to hash again, will be hashed in models
      password, // password will be hashed in the User model pre-save hook
      company,
      role: "manager",
      isVerified: false, // default value
      verificationToken: token,
      // send email Please verify your account: https://yourapp.com/verify?token=abc123
    });

    await newManager.save();

    res.status(201).json({
      message: "Manager registered successfully",
      manager: newManager,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//verify above users with email
export const verifyUserEmail = async (req, res) => {
  // is called when user clicks on the verification link in the email
  // the link should contain the token as a query parameter
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Token is required for verification" });
    }
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already verified" });
    }
    user.isVerified = true;
    user.verificationToken = null; // Clear the token after verification
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// login user | manager or superadmin
export const loginUser = async (req, res) => {
  try {
    console.log("Login cred:", req.body);
    const { email, password } = req.body;
    // Check if email and password are provided

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "User not verified. Please check your email for verification link.",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, company: user.company?._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // res.status(200).json({token, user}); // unsaafe bhayo yo alli
    const { password: _, ...userData } = user._doc; // Exclude password from response
    res.status(200).json({ token, user: userData });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

//other user functions

// Get all users
export const getAllUsers = async (req, res) => {
  const Users = await User.find().populate("company");
  res.json(Users);
};
