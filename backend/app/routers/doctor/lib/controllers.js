// app/routers/doctor/lib/controllers.js
const Doctor = require('../../../../models/lib/Doctor');
const User = require('../../../../models/lib/User');
const jwt = require('jsonwebtoken');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'email role');
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'email role');

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('Error fetching doctor:', err);
    
    // Handle invalid ObjectID format
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid doctor ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor by user ID
// @route   GET /api/doctors/me/profile
// @access  Private/Doctor
exports.getDoctorByUserId = async (req, res) => {
  try {
    // Check if user has doctor role
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can view their profile'
      });
    }

    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'email role');

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor profile not found for this user`,
        userId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('Error fetching doctor by user ID:', err);
    
    // Handle CastError
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin or Doctor (self)
exports.updateDoctor = async (req, res) => {
  try {
    let doctor = await Doctor.findById(req.params.id);

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id ${req.params.id}`
      });
    }

    // Make sure user is the doctor or an admin
    if (
      doctor.user.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile'
      });
    }

    // Update doctor
    doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('Error updating doctor:', err);
    
    // Handle invalid ObjectID format
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid doctor ID format`
      });
    }
    
    // Validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id ${req.params.id}`
      });
    }

    // Delete doctor
    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    
    // Handle invalid ObjectID format
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid doctor ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Private
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('availableTimeSlots');

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: doctor.availableTimeSlots
    });
  } catch (err) {
    console.error('Error fetching doctor availability:', err);
    
    // Handle invalid ObjectID format
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid doctor ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Register new doctor (create user with doctor role + doctor profile)
// @route   POST /api/doctors/register
// @access  Public
exports.registerDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      specialty, 
      licenseNumber, 
      contactInfo, 
      availableTimeSlots, 
      bio,
      isAcceptingNewPatients 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user with doctor role
    const user = await User.create({
      email,
      password,
      role: 'doctor'
    });

    // Create doctor profile linked to this user
    const doctorData = {
      user: user._id,
      name,
      specialty,
      licenseNumber,
      contactInfo,
      availableTimeSlots,
      bio,
      isAcceptingNewPatients
    };

    // Filter out undefined fields
    Object.keys(doctorData).forEach(key => {
      if (doctorData[key] === undefined) {
        delete doctorData[key];
      }
    });

    const doctor = await Doctor.create(doctorData);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      doctor
    });
  } catch (err) {
    console.error('Error registering doctor:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        errors: messages
      });
    }

    // If we created a user but doctor creation failed, clean up by deleting the user
    if (err.name !== 'ValidationError' && err._doc && err._doc.email) {
      await User.findByIdAndDelete(err._doc._id);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};