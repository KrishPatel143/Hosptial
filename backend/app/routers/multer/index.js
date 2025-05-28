const express = require('express');
const router = express.Router();
const { 
  uploadSingle, 
  uploadMultiple, 
  handleFileUpload,
  serveUploadedFile 
} = require('./lib/index');
const { auth } = require('../patient/lib/middlewares'); // Assuming you want to use authentication

// Single file upload route (authenticated)
router.post('/upload', 
  auth, // Optional: remove if you want public uploads
  uploadSingle, 
  handleFileUpload
);

// Multiple file upload route (authenticated)
router.post('/upload-multiple', 
  auth, // Optional: remove if you want public uploads
  uploadMultiple, 
  handleFileUpload
);

// Route to serve uploaded files
router.get('/uploads/:filename', serveUploadedFile);

module.exports = router;