const express = require('express');
const {
  createDelivery,
  getAllDeliveries,
  getMyDeliveries,
  getDelivery,
  updateDeliveryStatus,
  updateDeliveryLocation,
  getDeliveryStats,
  cancelDelivery,
 getActiveDeliveries,
  autoAssignDelivery,
  calculateETA
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');
const { protectWithMultiRole, authorizeForApp } = require('../middleware/multiRoleAuth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Public route to get a specific delivery (with proper authorization checks in controller)
router.get('/:id', getDelivery);

// Routes for store/seller to create and manage deliveries
router.route('/')
  .post(
    protectWithMultiRole,
    authorizeForApp('store'),
    createDelivery
  )
  .get(
    protectWithMultiRole,
    (req, res, next) => {
      // Allow different roles to access this route based on their permissions
      if (req.user.activeRole === 'admin') {
        // Admin can get all deliveries
        authorize('admin')(req, res, next);
      } else {
        // Other roles get their own deliveries
        next();
      }
    },
    getMyDeliveries
 );

// Route to get all deliveries (admin only)
router.get('/', protect, authorize('admin'), getAllDeliveries);

// Route to get active deliveries for a driver
router.get('/active',
  protectWithMultiRole,
  authorizeForApp('driver'),
  getActiveDeliveries
);

// Route to get delivery statistics
router.get('/stats',
  protectWithMultiRole,
  (req, res, next) => {
    // Allow different roles to access stats based on their data
    if (['driver', 'store', 'admin'].includes(req.user.activeRole)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view delivery statistics'
      });
    }
  },
  getDeliveryStats
);

// Route to update delivery status
router.put('/:id/status',
  protectWithMultiRole,
  authorizeForApp('driver'),
  updateDeliveryStatus
);

// Route to update delivery location (real-time tracking)
router.put('/:id/location',
  protectWithMultiRole,
  authorizeForApp('driver'),
  updateDeliveryLocation
);

// Route to cancel delivery
router.put('/:id/cancel',
  protectWithMultiRole,
  (req, res, next) => {
    // Allow store, admin, or customer to cancel
    if (['store', 'admin', 'customer'].includes(req.user.activeRole)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel delivery'
      });
    }
  },
  cancelDelivery
);

// Route to auto-assign delivery
router.post('/:id/auto-assign',
  protectWithMultiRole,
  authorizeForApp('store'),
  autoAssignDelivery
);

// Route to calculate ETA
router.get('/:id/eta',
  protectWithMultiRole,
  (req, res, next) => {
    // Allow different roles to access ETA based on their relationship to the delivery
    next();
  },
  calculateETA
);

module.exports = router;