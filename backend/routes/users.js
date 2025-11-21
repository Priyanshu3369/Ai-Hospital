// backend/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// All routes here are admin-only
router.use(protect, authorizeRoles('admin'));

// Create user (admin)
router.post('/', userController.createUser);

// List users with pagination
router.get('/', userController.listUsers);

// Get a user
router.get('/:id', userController.getUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
