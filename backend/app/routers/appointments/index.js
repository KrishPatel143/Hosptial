// app/routers/appointment/index.js
const express = require('express');
const router = express.Router();
const { 
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAvailableSlots,
  getAllDoctors,
  addDoctor,
  getAllAppointments,
  createAppointmentByAdmin,
  completeAppointment,
  getMedicalHistory,
  getPatientMedicalHistory
} = require('./lib/controllers');
const { auth, checkRoleAdmin, checkRole } = require('../patient/lib/middlewares');

// Apply authentication to all appointment routes
router.get('/doctors', getAllDoctors);
router.post('/doctors', addDoctor);

// IMPORTANT: Define more specific routes BEFORE generic routes with path params
// Route for getting all doctors - place this BEFORE the /:id route
router.use(auth);

// Medical history routes
router.get('/medical-history', getMedicalHistory); // For logged-in patient
router.get('/patients/:patientId/medical-history', checkRole(['admin']), getPatientMedicalHistory);

// Admin-specific route with role check
router.post('/admin',  createAppointmentByAdmin);

// Route for doctor available slots
router.get('/doctor/:doctorId/available-slots', getDoctorAvailableSlots);

// Complete appointment route (for doctors and admins)
router.put('/:id/complete', checkRole(['doctor', 'admin']), completeAppointment);

// Appointment routes
router.route('/')
.post(createAppointment)
.get(getAppointments);
router.route('/all').get(getAllAppointments);
  
  // Single appointment routes - this must come AFTER any other routes like /doctors
router.route('/:id')
.get(getAppointment)
.put(updateAppointment)
.delete(deleteAppointment);
  

module.exports = router;