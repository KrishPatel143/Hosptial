// app/routers/patient/lib/controllers.js
const User = require('../../../../models/lib/User');
const Patient = require('../../../../models/lib/Patient');
const jwt = require('jsonwebtoken');

// ===================== AUTH CONTROLLERS =====================

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("🚀 ~ exports.register= ~ req.body:", req.body)

    console.log("🚀 ~ exports.register= ~ process.env.JWT_SECRET,:", process.env.JWT_SECRET,)
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient' // Default to patient if no role provided
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("🚀 ~ exports.login= ~ req.body:", req.body)

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find user with password field included
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    
    // Save user to trigger password hashing middleware
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during password update'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profilePic } = req.body;
    
    // Find user by ID
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create update object with only allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePic) updateData.profilePic = profilePic;

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// ===================== PATIENT CONTROLLERS =====================

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Doctor
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    // console.log("🚀 ~ exports.getPatients= ~ patients:", patients)
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {

    const patient = await Patient.findOne({ user: req.user.id });

    // Check if patient exists
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: `Patient not found with id of ${req.user.id}`
      });
    }

    // Make sure user is patient owner or an admin or a doctor
    if (
      patient.user._id.toString() !== req.user.id.toString() && 
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    }); 
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    // If request comes from a patient user, use their ID
    if (req.user.role === 'patient') {
      req.body.user = req.user.id;
    }

    // Check if patient already exists for this user
    const existingPatient = await Patient.findOne({ user: req.body.user });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'User already has a patient profile'
      });
    }
    
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Admin create patient
// @route   POST /api/patients/admin-create
// @access  Private/Admin
exports.adminCreatePatient = async (req, res) => {
  try {
    // Check if user is admin (additional security layer)
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Only admins can access this endpoint'
    //   });
    // }

    const { name, email, gender, age, phone, bloodType } = req.body;

    // Validate required fields
    if (!name || !email) {
      
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user with default password
    const defaultPassword = '12345678';
    const user = await User.create({
      email,
      password: defaultPassword,
      role: 'patient'
    });

    // Create patient profile connected to the user
    const patientData = {
      user: user._id,
      profile: {
        name,  
        email,
        gender,
        age,
        phone,
        bloodType
      }
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully by admin',
      data: {
        patient,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        defaultPassword: defaultPassword // Including this for the admin to share with the patient
      }
    });
  } catch (err) {
    
    console.error('Admin create patient error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during patient creation'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.user.id });

    // Check if patient exists
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient not found with id of ${req.user.id}`
      });
    }

    // Make sure user is patient owner or an admin
    if (
      patient.user._id.toString() !== req.user.id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient'
      });
    }

    // Update patient
    patient = await Patient.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    }); 
  }
};
exports.updatePatientById = async (req, res) => {
  try {
    // let patient = await Patient.findOne({ user: req.params.id });

    // // Check if patient exists
    // if (!patient) {
    //   return res.status(404).json({
    //     success: false,
    //     message: `Patient not found with id of ${req.params.id }`
    //   });
    // }


    // Update patient
    patient = await Patient.findByIdAndUpdate(
       req.params.id  ,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    }); 
  }
};

// @desc    Get patient medical records
// @route   GET /api/patients/:id/medical-records
// @access  Private
exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('medicalRecords');

    // Check if patient exists
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient not found with id of ${req.params.id}`
      });
    }

    // Make sure user is patient owner or an admin or a doctor
    if (
      patient.user.toString() !== req.user.id.toString() && 
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access medical records'
      });
    }

    res.status(200).json({
      success: true,
      data: patient.medicalRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};