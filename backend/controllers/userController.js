import User from '../modelsUser.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async(req, res) => {
    try{
        const { name, email, password, company } = req.body;
        // Check if all fields are provided
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'user already exists' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password stored:", hashedPassword);

        const newUser = new User({
            name,
            email,
            password,
            company
        });
        await newUser.save();
        res.status(201).json({ message: 'user registered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message});
    }
};

export const loginUser = async (req,res) => {
    try{
        const {email, password} = req.body;
        // Check if email and password are provided

        const User = await User.findOne({ email });
        if (!User) {
            return res.status(404).json({ message: 'user not found' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, User.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: User._id, company: User.company._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // res.status(200).json({token, user}); // unsaafe bhayo yo alli
        const { password: _, ...UserData } = User._doc; // Exclude password from response
        res.status(200).json({ token, User: UserData });
    }
    catch(err) {
        res.status(500).json({ message: 'Internal server error', error: err.message});
    }   
};

export const getAllUsers = async (req, res) => {
    const Users = await User.find().populate('company');
    res.json(Users);
};