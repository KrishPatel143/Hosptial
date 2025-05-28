// app/routers/patient/index.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  updatePassword,
  getMe,
  getPatients,
  getPatient,
  createPatient,
  adminCreatePatient,
  updatePatient,
  deletePatient,
  getPatientMedicalRecords,
  updatePatientById,
  updateProfile
} = require('../patient/lib/controllers');
const { auth, checkRole } = require('../patient/lib/middlewares');

// Public auth routes - no auth required
router.post('/register', register);
router.post('/login', login); // This should work now
router.put('/update-password', auth, updatePassword);

// Protected user route
router.get('/me', auth, getMe);
router.put('/update-profile', auth, updateProfile);

// Protected patient routes
router.use('/patients', auth); // Apply auth only to patient routes

// Patient routes
router.get('/patient', auth,getPatient);
router.get('/patients', getPatients);
router.post('/patients', createPatient);
router.post('/admin-create', auth, adminCreatePatient);

router.route('/detail')
  .get(auth ,getPatient)
  .put(auth , updatePatient)

router.route('/admin/:id')
  .put(auth , updatePatientById)



// Medical records route
router.get('/patients/:id/medical-records', getPatientMedicalRecords);

module.exports = router;