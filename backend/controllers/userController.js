import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js'; // Assuming you have a utility to send emails


// register superadmin and manager
export const registerSuperAdmin = async(req, res) => {
    try{
        const { name, email, password } = req.body;
        // Check if all fields are provided
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'user already exists' });
        }

        // Create new user
        //const hashedPassword = await bcrypt.hash(password, 10); // modelma hashed xa
        //console.log("Hashed password stored:", hashedPassword);

        // create token
        const token = crypto.randomBytes(32).toString('hex'); // Generate a random token
        

        const newSuperAdmin = new User({
            name,
            email,
            password,
            role: 'superadmin', // Set role to superadmin
            isVerified: false, // default value
            verificationToken: token 
        });
        await newSuperAdmin.save();
        
        // Send verification email
        const verifyLink = `${process.env.BACKEND_URL}/api/user/verify-email?token=${token}`;
        const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a> 
        `;

        await sendEmail(email, 'Verify your email', message);
        
        // console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

        res.status(201).json({ message: 'SuperAdmin registered successfully. Please check your email to verify your account.' });
        

    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message});
    }
};

export const registerManager = async(req,res)=>{
    try{
        const {name,email} = req.body;
        // Check if all fields are

        if (!name || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        //check company exists or not
        const company = req.user.company; // Assuming the company is set in the request by auth middleware
        console.log('Registering manager under company:', company);
        if (!company) {
            return res.status(400).json({ message: 'Your user does not have a company assigned' });
        }

        
        // seprate company check parxa kinai no idea
        const existing = await User.findOne({ email }); //
        if (existing){
            return res.status(400).json({ message: ' Manager already exists' });
        }
        // password is not required for manager registration dummy will be set at first
        const password = '123456'; // Set a dummy password for manager registration 
        
        //hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        //create token for verification
        const token = crypto.randomBytes(32).toString('hex'); // Generate a random token
        //create manager
        const newManager = new User({
            name,
            email,
            // password: hashedPassword, // not necessary to hash again, will be hashed in models
            password, // password will be hashed in the User model pre-save hook
            company, 
            role: 'manager',
            isVerified: false, // default value
            verificationToken: token 
            // send email Please verify your account: https://yourapp.com/verify?token=abc123
        });

        await newManager.save();

        // Send verification email
        const verifyLink = `${process.env.BACKEND_URL}/api/user/verify-email?token=${token}`;
        const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
        `;
        await sendEmail(email, 'Verify your email', message);
        // console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

        res.status(201).json({message: 'Manager registered successfully'});

    }catch(error){
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


//verify above users with email
export const verifyUserEmail = async(req,res) => { //issue is? 
    // is called when user clicks on the verification link in the email
    // the link should contain the token as a query parameter
    try{
        const {token }  = req.query;
        if (!token) {
            return res.status(400).json({message: 'Token is required for verification'});
        }
        const user = await User.findOne({ verificationToken: token });
        if (!user){
            return res.status(404).json({ message: 'User not found or already verified' });
        }
        user.isVerified = true;
        user.verificationToken = null; // Clear the token after verification
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });

    }catch(error){
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}



// login user | manager or superadmin
export const loginUser = async (req,res) => {
    try{
        const {email, password} = req.body;
        // Check if email and password are provided

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'User not verified. Please check your email for verification link.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, company: user.company?._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // res.status(200).json({token, user}); // unsaafe bhayo yo alli
        const { password: _, ...userData } = user._doc; // Exclude password from response
        res.status(200).json({ token, user: userData });
    }catch(err) {
        res.status(500).json({ message: 'Internal server error', error: err.message});
    }   
};


//other user functions


// Get all users
export const getAllUsers = async (req, res) => {
    const Users = await User.find().populate('company');
    res.json(Users);
};


// get single user

export const getUserById = async(req,res) => {
    try{
        const{id} = req.params;

        const user = await User.findById(id).populate('company').select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json({message: "internal server error", error:error.message});
    }

}


// Update user
export const updateUser = async(req,res) => {
    try{
        const { id } = req.params;

        const requester = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // manager can only update users in their company
        if (requester.role === 'manager' && user.company.toString() !== requester.company.toString()) {
            return res.status(403).json({ message: 'You are not allowed to update this user' });
        }

        // update allowed fields
        const {name, email, password ,role} = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (role && requester.role === 'superadmin') {
            user.role = role; // Only superadmin can change role
        }
        if (password) {
            user.password = await password; // Password will be hashed in the User model pre-save hook
        }

        await user.save();

        const { password: _, ...updatedUser } = user._doc; // Exclude password from response
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch(err){
        return res.status(500).json({message: "internal server error", error: err.message});
    }

}   


// Delete user
export const deleteUser = async(req,res) => {
    try{
        const { id } = req.params;

        const requester = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // manager can only delete users in their company
        if (requester.role === 'manager' && user.company.toString() !== requester.company.toString()) {
            return res.status(403).json({ message: 'You are not allowed to delete this user' });
        }

        // Delete user
        await User.deleteOne({ _id: id });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch(err){
        return res.status(500).json({message: "internal server error", error: err.message});
    }
}

//change password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // const user = req.user; // User is attached to the request by auth middleware // so what happened was when this was done, no password was sent and as such + password is added , which allows for comparision
        const user = await User.findById(req.user._id).select('+password');
        

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }
            // Check if old password matches
        const isMatch = await user.comparePassword(oldPassword); 
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Update password
        user.password = newPassword; // Password will be hashed in the User model pre-save hook
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


//password reset
export const requestPasswordReset = async (req, res) => {
    try{
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({message: 'User not found'});

        //generate token 
        const token = crypto.randomBytes(32).toString('hex');
        console.log("token is : ", token);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now()+ 1000*60*15; // token is valid for 15 min
        await user.save();

        const resetLink =`${process.env.BACKEND_URL}/reset-password?token=${token}`;
        const message = `
            <h1>Password Reset</h1>
            <p>Click below to reset your password: </p>
            <a href = "${resetLink}">Reset Password</a>    
        `;
        await sendEmail(user.email, 'Reset Your Password', message);
        res.status(200).json({message:"Password reset email sent"});;;

    }
    catch(error){
    res.status(500).json({ message: 'Internal server error', error: error.message });   
    }
};
export const resetPassword = async (req, res) => {
  //const { email, newPassword, resetToken } = req.body;

  try {

    // Find user by email and reset token
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    // Update user's password
    user.password = newPassword;
    user.resetPasswordToken = null; // Clear reset token
    user.resetPasswordExpires = null; // Clear expiration date
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
}