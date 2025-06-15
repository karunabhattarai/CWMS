// middleware/roleMiddleware.js

import User from '../models/User.js';

const allowRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  };
};

export default allowRoles;
// This middleware checks if the user has one of the allowed roles
// before allowing access to certain routes. It retrieves the user from the database