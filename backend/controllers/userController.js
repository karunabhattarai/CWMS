import User from "../models/User.js";
import { createMemberInternal } from './memberController.js';
import Member from "../models/Member.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // Assuming you have a utility to send emails

//mixing sabko manager and employee into one registerUser

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, memberRoles } = req.body; // memberRoles only for employee
    const company = req.user?.company || null; // company for manager and employee

    // const requesterRole = req.user?.role;

    // if (role === 'manager' && requesterRole !== 'superadmin') {
    //   return res.status(403).json({ message: 'Only superadmin can create managers' });
    // }

    // if (role === 'employee' && !['superadmin', 'manager'].includes(requesterRole)) {
    //   return res.status(403).json({ message: 'Only superadmin or manager can create employees' });
    // }

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set default password if not provided (for manager and employee)
    const userPassword = password || '123456';

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Prepare new user data
    const newUserData = {
      name,
      email,
      password: userPassword, // will be hashed in model
      role,
      isVerified: false,
      verificationToken: token,
    };

    if (role === 'manager' || role === 'employee') {
      if (!company) {
        return res.status(400).json({ message: 'Your user does not have a company assigned' });
      }
      newUserData.company = company;
    }

    // If employee,and memberId is present then update the member and else create the member
    if (role === 'employee') {
      if (req.body.memberId) {
        // Update existing member
        const member = await Member.findOne({ _id: req.body.memberId, company });
        if (!member) {
          return res.status(404).json({ message: 'Member not found' });
        }
        member.name = name || member.name;
        member.email = email || member.email;
        if (memberRoles) member.roles = memberRoles;
        await member.save();
        newUserData.member = member._id;
      } else {
        // Create new member
        const member = await createMemberInternal({
          name,
          email,
          roles: memberRoles || [],
          company,
        });
        newUserData.member = member._id;
      }
    }

    // Save user
    const newUser = new User(newUserData);
    await newUser.save();

    // Send verification email
    const verifyLink = `${process.env.BACKEND_URL}/api/user/verify-email?token=${token}`;
    const message = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
    `;
    await sendEmail(email, 'Verify your email', message);

    // Send response
    const msg = `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully. Email verification link sent to email.`;


    res.status(201).json({ message: msg, user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

//verify above users with email
export const verifyUserEmail = async (req, res) => {
  //issue is?
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
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({
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
  try {
    if (!req.user.company) {
      return res
        .status(400)
        .json({ message: "You are not assigned to any company" });
    }

    const users = await User.find({ company: req.user.company })
      .populate("company")
      .select("-password");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// get single user

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("company")
      .select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const requester = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // manager can only update users in their company
    if (
      requester.role === "manager" &&
      user.company.toString() !== requester.company.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this user" });
    }

    // update allowed fields
    const { name, email, password, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && requester.role === "superadmin") {
      user.role = role; // Only superadmin can change role
    }
    if (password) {
      user.password = await password; // Password will be hashed in the User model pre-save hook
    }

    await user.save();

    const { password: _, ...updatedUser } = user._doc; // Exclude password from response
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const requester = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // manager can only delete users in their company
    if (
      requester.role === "manager" &&
      user.company.toString() !== requester.company.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this user" });
    }

    // Delete user
    await User.deleteOne({ _id: id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server error", error: err.message });
  }
};

//change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // const user = req.user; // User is attached to the request by auth middleware // so what happened was when this was done, no password was sent and as such + password is added , which allows for comparision
    const user = await User.findById(req.user._id).select("+password");

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }
    // Check if old password matches
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Update password
    user.password = newPassword; // Password will be hashed in the User model pre-save hook
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    //generate token
    const token = crypto.randomBytes(32).toString("hex");
    console.log("token is : ", token);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // token is valid for 15 min
    await user.save();

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${token}`;
    const message = `
            <h1>Password Reset</h1>
            <p>Click below to reset your password: </p>
            <a href = "${resetLink}">Reset Password</a>    
        `;
    await sendEmail(user.email, "Reset Your Password", message);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const resetPassword = async (req, res) => {
  //const { email, newPassword, resetToken } = req.body;

  try {
    // Find user by email and reset token
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required" });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
    // Update user's password
    user.password = newPassword;
    user.resetPasswordToken = null; // Clear reset token
    user.resetPasswordExpires = null; // Clear expiration date
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};
