const MedicalReport = require('../../../../models/lib/MedicalReport');
const path = require('path');
const fs = require('fs');
const Patient = require('../../../../models/lib/Patient');
const { log } = require('console');
  
// Create a new medical report
exports.createMedicalReport = async (req, res) => {
    try {
      const { 
        type, 
        date, 
        doctor, 
        category, 
        status, 
        findings, 
        recommendations 
      } = req.body;
  
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File upload is required'
        });
      }
  
      // Validate required fields
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }
  
      // Prepare report data with defaults
      const reportData = {
        patient: req.user._id,
        type,
        date: date ? new Date(date) : new Date(),
        doctor: doctor, // Assuming doctor is the current user for simplicity
        category: category || 'Other', // Default to 'Other' if not provided
        status: status || 'Pending', // Default to 'Pending' if not provided
        fileURL: `multer/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
        findings: findings || '',
        recommendations: recommendations || ''
      };
  
      // Create medical report
      const medicalReport = new MedicalReport(reportData);
  
      // Save the report
      await medicalReport.save();
  
      res.status(201).json({
        success: true,
        message: 'Medical report created successfully',
        report: medicalReport
      });
    } catch (error) {
      console.error('Create medical report error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }
  
      res.status(500).json({
        success: false,
        message: 'Error creating medical report',
        error: error.message
      });
    }
  };
exports.createMedicalReportByAdmin = async (req, res) => {
    try {
      const { 
        patient, 
        type, 
        date, 
        doctor, 
        category, 
        status, 
        findings, 
        recommendations 
      } = req.body;
      
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File upload is required'
        });
      }
  
      // Validate required fields
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }
  
      // Prepare report data with defaults
      const reportData = {
        patient: patient,
        type,
        date: date ? new Date(date) : new Date(),
        doctor: doctor, // Assuming doctor is the current user for simplicity
        category: category || 'Other', // Default to 'Other' if not provided
        status: status || 'Pending', // Default to 'Pending' if not provided
        fileURL: `multer/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
        findings: findings || '',
        recommendations: recommendations || ''
      };
  
      // Create medical report
      const medicalReport = new MedicalReport(reportData);
  
      // Save the report
      await medicalReport.save();
  
      res.status(201).json({
        success: true,
        message: 'Medical report created successfully',
        report: medicalReport
      });
    } catch (error) {
      console.error('Create medical report error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }
  
      res.status(500).json({
        success: false,
        message: 'Error creating medical report',
        error: error.message
      });
    }
  };

// Get all medical reports for the authenticated patient
exports.getMedicalReports = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        status, 
        search 
      } = req.query;
  
      // Build query
      const query = { patient: req.user._id };
      
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { type: { $regex: search, $options: 'i' } },
          { findings: { $regex: search, $options: 'i' } }
        ];
      }
  
      // Pagination options
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { date: -1 }, // Sort by most recent first
        select: '-patient', // Exclude patient details
        lean: true, // Return plain JavaScript objects instead of Mongoose documents
        pagination: true
      };
  
      // Fetch reports with pagination
      const result = await MedicalReport.paginate(query, options);
  
      // Transform result to match frontend expectations
      const response = {
        docs: result.docs,
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      };
  
      res.json(response);
    } catch (error) {
      console.error('Get medical reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medical reports',
        error: error.message
      });
    }
  };
  exports.getAllMedicalReports = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        status, 
        search 
      } = req.query;
  
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { type: { $regex: search, $options: 'i' } },
          { findings: { $regex: search, $options: 'i' } }
        ];
      }
  
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { date: -1 }, 
        pagination: true,
      };
      
      // Fetch reports with pagination
      const result = await MedicalReport.paginate(query, options);
      
      // Get all unique patient IDs from the results
      const patientIds = result.docs.map(doc => doc.patient);
      
      // Fetch patient data for all patients
      const patients = await Patient.find({user: {$in: patientIds}});
      
      // Create a map for quick lookup
      const patientMap = {};
      patients.forEach(patient => {
        patientMap[patient.user.toString()] = patient;
      });
      
      // Add patient data to each medical report
      const docsWithPatients = result.docs.map(doc => ({
        ...doc.toObject(),
        patientInfo: patientMap[doc.patient.toString()] || null
      }));
  
      // Transform result to match frontend expectations
      const response = {
        docs: docsWithPatients,
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      };
  
      res.json(response);
    } catch (error) {
      console.error('Get medical reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medical reports',
        error: error.message
      });
    }
  };
// Get a single medical report
exports.getSingleMedicalReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
    }).populate('doctor', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get single medical report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical report',
      error: error.message
    });
  }
};

// Update a medical report
exports.updateMedicalReport = async (req, res) => {
  try {
    const { 
      type, 
      date, 
      category, 
      status, 
      findings, 
      recommendations 
    } = req.body;

    // Find the existing report
    const existingReport = await MedicalReport.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }

    // Update basic fields
    existingReport.type = type || existingReport.type;
    existingReport.date = date ? new Date(date) : existingReport.date;
    existingReport.category = category || existingReport.category;
    existingReport.status = status || existingReport.status;
    existingReport.findings = findings || existingReport.findings;
    existingReport.recommendations = recommendations || existingReport.recommendations;

    // Handle file update if new file is uploaded
    if (req.file) {
      // Remove old file if exists
      if (existingReport.fileURL) {
        const oldFilePath = path.join(__dirname, '../../../../uploads', path.basename(existingReport.fileURL));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update with new file details
      existingReport.fileURL = `/uploads/${req.file.filename}`;
      existingReport.mimetype = req.file.mimetype;
      existingReport.size = req.file.size;
    }

    // Save updated report
    await existingReport.save();

    res.json({
      success: true,
      message: 'Medical report updated successfully',
      report: existingReport
    });
  } catch (error) {
    console.error('Update medical report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medical report',
      error: error.message
    });
  }
};

// Delete a medical report
exports.deleteMedicalReport = async (req, res) => {
  try {
    // Find and delete the report
    const report = await MedicalReport.findOneAndDelete({
      _id: req.params.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }

    // Remove associated file
    if (report.fileURL) {
      const filePath = path.join(__dirname, '../../../../uploads', path.basename(report.fileURL));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Medical report deleted successfully'
    });
  } catch (error) {
    console.error('Delete medical report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medical report',
      error: error.message
    });
  }
};
