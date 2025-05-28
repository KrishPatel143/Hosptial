// app/routers/doctor/index.js
const express = require('express');
const router = express.Router();
const { 
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorByUserId,
  getDoctorAvailability,
  registerDoctor
} = require('./lib/controllers');
const { auth, checkRole } = require('../patient/lib/middlewares');

// Public route to register a new doctor (with admin approval required)
router.post('/register', auth, registerDoctor);

// Get all doctors - accessible to all authenticated users
router.get('/', auth, getDoctors);

// Get doctor by user ID - for doctors to access their own profile
// This needs to come before /:id route to avoid conflict
router.get('/me/profile', auth, getDoctorByUserId);

// Get specific doctor by ID - accessible to all authenticated users
router.get('/:id', auth, getDoctor);

// Get doctor availability - accessible to all authenticated users
router.get('/:id/availability', auth, getDoctorAvailability);


// Update doctor - admin or the doctor themselves
router.put('/:id', auth, updateDoctor);

// Delete doctor - admin only
router.delete('/:id', auth, deleteDoctor);

module.exports = router;