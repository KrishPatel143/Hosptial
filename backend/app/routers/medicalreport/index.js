const express = require('express');
const router = express.Router();
const { 
  createMedicalReport, 
  getMedicalReports, 
  updateMedicalReport, 
  deleteMedicalReport,
  getSingleMedicalReport, 
  getAllMedicalReports,
  createMedicalReportByAdmin
} = require('./lib/index');
const { uploadSingle } = require('../multer/lib');
const { auth } = require('../patient/lib/middlewares');

// Create a new medical report (authenticated)
router.post('/', 
  auth, 
  uploadSingle, 
  createMedicalReport
);
router.post('/admin-add', 
  auth, 
  uploadSingle, 
  createMedicalReportByAdmin
);

// Get all medical reports for the authenticated patient
router.get('/', 
  auth, 
  getMedicalReports
);
router.get('/all',  
  auth, 
  getAllMedicalReports
);

// Get a single medical report by ID
router.get('/:id', 
  auth, 
  getSingleMedicalReport
);

// Update a medical report
router.put('/:id', 
  auth, 
  uploadSingle, 
  updateMedicalReport
);

// Delete a medical report
router.delete('/:id', 
  auth, 
  deleteMedicalReport
);

module.exports = router;