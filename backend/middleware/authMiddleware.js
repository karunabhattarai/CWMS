import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req,res,next) => {
    const authHeader = req.headers.authorization;

    //check if authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorizedd' });
    }

    const token = authHeader.split(' ')[1];

    try{
        //2 verify token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        
        //3 attach user to request object
        const user = await User.findById(decoded.id).select('-password'); // Exclude password from user object
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        next(); // Call the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;
// This middleware checks for a valid JWT token in the Authorization header