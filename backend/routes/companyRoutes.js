// routes/companyRoutes.js
import express from 'express';
import { 
    createCompany,
    getCompany,
    updateCompany, 
    deleteCompany 
} from '../controllers/companyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import allowRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create a company (Superadmin only)
router.post(
    '/create', 
    authMiddleware,
    allowRoles('superadmin'), // Only allow superadmin
    createCompany
);


// Get logged-in user's company (Superadmin only)
router.get(
  '/', 
  authMiddleware,
  allowRoles('superadmin, manager'), // Allow both superadmin and manager
  getCompany
);

// Update company (Superadmin only)
router.put(
  '/update', 
  authMiddleware,
  allowRoles('superadmin'),
  updateCompany
);

// Delete company (Superadmin only)
router.delete(
  '/delete', 
  authMiddleware,
  allowRoles('superadmin'),
  deleteCompany
);



















export default router;
