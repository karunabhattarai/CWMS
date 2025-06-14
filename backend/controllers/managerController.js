import Manager from '../models/Manager.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerManager = async(req, res) => {
    try{
        const { name, email, password, company } = req.body;
        // Check if all fields are provided
        const existing = await Manager.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Manager already exists' });
        }

        // Create new manager
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password stored:", hashedPassword);

        const newManager = new Manager({
            name,
            email,
            password,
            company
        });
        await newManager.save();
        res.status(201).json({ message: 'Manager registered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message});
    }
};

export const loginManager = async (req,res) => {
    try{
        const {email, password} = req.body;
        // Check if email and password are provided

        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, manager.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: manager._id, company: manager.company._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // res.status(200).json({token, manager}); // unsaafe bhayo yo alli
        const { password: _, ...managerData } = manager._doc; // Exclude password from response
        res.status(200).json({ token, manager: managerData });
    }
    catch(err) {
        res.status(500).json({ message: 'Internal server error', error: err.message});
    }   
};

export const getAllManagers = async (req, res) => {
    const managers = await Manager.find().populate('company');
    res.json(managers);
};