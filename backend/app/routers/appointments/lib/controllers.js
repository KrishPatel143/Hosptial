// app/routers/appointment/lib/controllers.js
const Appointment = require('../../../../models/lib/Appointment');
const Doctor = require('../../../../models/lib/Doctor');
const Patient = require('../../../../models/lib/Patient');
const MedicalReport = require('../../../../models/lib/MedicalReport');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    
    const {  doctor, date, time, type, notes } = req.body;

    // Variable to store the patient ID
    let patientId = req.user.id;

    // Check if user is a patient creating their own appointment
    if (req.user.role === 'patient') {
      // Verify the patient ID belongs to the logged-in user
      const patientRecord = await Patient.findOne({ user: req.user._id });
      
      if (!patientRecord) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found for this user'
        });
      }
      
      // Set the patient ID to the patient's ID associated with the logged-in user
      patientId = patientRecord._id;
    }

    // Ensure patient ID is provided
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Check if the appointment time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: new Date(date),
      time,
      status: { $nin: ['canceled', 'no-show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create the appointment with the confirmed patient ID
    const appointmentData = {
      patient: patientId,
      doctor,
      date,
      time,
      type,
      notes
    };

    const appointment = await Appointment.create(appointmentData);

    // Populate doctor and patient info for the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'profile.name')
      .populate('patient', 'profile.name');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      console.log("loooo");
      
      const errorMessages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createAppointmentByAdmin = async (req, res) => {
  try {
    const { patient, doctor, date, time, type, notes } = req.body;

    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    // Check if the patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if the doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if the appointment time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: new Date(date),
      time,
      status: { $nin: ['canceled', 'no-show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create the appointment
    const appointmentData = {
      patient,
      doctor,
      date,
      time,
      type,
      notes
    };

    const appointment = await Appointment.create(appointmentData);

    // Populate doctor and patient info for the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'profile.name specialty')
      .populate('patient', 'profile.name profile.email profile.phone');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (err) {
    console.error('Admin create appointment error:', err);
    
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    // Find the patient associated with the logged-in user
    
    // Find appointments and populate the doctor field
    const appointments = await Appointment.find()
      .populate('doctor')
      .populate('patient')  // This will replace doctor IDs with the actual doctor documents
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
exports.getAppointments = async (req, res) => {
  try {
    // Find the patient associated with the logged-in user
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Query appointments for this patient
    const query = { patient: patient.id };
    
    // Find appointments and populate the doctor field
    const appointments = await Appointment.find(query)
      .populate('doctor')
      .populate('patient')  // This will replace doctor IDs with the actual doctor documents
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'profile.name profile.specialization')
      .populate('patient', 'profile.name profile.email profile.phone');

    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`
      });
    }

    // Check authorization: Only the patient, the doctor, or admin can view the appointment
    if (
      req.user.role === 'patient' &&
      !(await isPatientOwner(req.user.id, appointment.patient._id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    if (
      req.user.role === 'doctor' &&
      !(await isDoctorOwner(req.user.id, appointment.doctor._id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`
      });
    }

    // Check authorization: Only the patient, the doctor, or admin can update the appointment
    if (
      req.user.role === 'patient' &&
      !(await isPatientOwner(req.user.id, appointment.patient))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    if (
      req.user.role === 'doctor' &&
      !(await isDoctorOwner(req.user.id, appointment.doctor))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // If changing date/time, check availability
    if ((req.body.date || req.body.time) && req.body.status !== 'canceled') {
      const existingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        date: new Date(req.body.date || appointment.date),
        time: req.body.time || appointment.time,
        _id: { $ne: req.params.id }, // Exclude current appointment
        status: { $nin: ['canceled', 'no-show'] }
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }
    }

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctor', 'profile.name')
      .populate('patient', 'profile.name');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`
      });
    }

    // Check authorization: Only the patient, doctor, or admin can delete
    if (
      req.user.role === 'patient' &&
      !(await isPatientOwner(req.user.id, appointment.patient))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    if (
      req.user.role === 'doctor' &&
      !(await isDoctorOwner(req.user.id, appointment.doctor))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    // Instead of hard delete, mark as canceled if appointment is in the future
    const currentDate = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointmentDate > currentDate) {
      appointment.status = 'canceled';
      await appointment.save();
    } else {
      // Hard delete if appointment is in the past
      await Appointment.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/doctor/:doctorId/available-slots
// @access  Private
exports.getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Convert date to day of week (e.g., "Monday", "Tuesday")
    const requestedDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[requestedDate.getDay()];
    
    // Find doctor's available time slots for this day
    const timeSlot = doctor.availableTimeSlots.find(slot => slot.day === dayOfWeek);
    
    if (!timeSlot) {
      return res.status(200).json({
        success: true,
        data: {
          availableSlots: [],
          message: 'Doctor is not available on this day'
        }
      });
    }

    // Generate all possible time slots
    const slots = generateTimeSlots(
      timeSlot.startTime,
      timeSlot.endTime,
      30 // Default 30 minute slots
    );

    // Find booked appointments for the doctor on the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['canceled', 'no-show'] }
    });

    // Filter out booked slots
    const bookedTimes = bookedAppointments.map(app => app.time);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date: date,
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty
        },
        availableSlots
      }
    });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to check if user is the patient
async function isPatientOwner(userId, patientId) {
  const patient = await Patient.findById(patientId);
  return patient && patient.user.toString() === userId.toString();
}

// Helper function to check if user is the doctor
async function isDoctorOwner(userId, doctorId) {
  const doctor = await Doctor.findById(doctorId);
  return doctor && doctor.user.toString() === userId.toString();
}

// @desc    Get all doctors
// @route   GET /api/appointments/doctors
// @access  Private
exports.getAllDoctors = async (req, res) => {
  try {
    // Query parameters for filtering
    const { specialty, isAcceptingNewPatients } = req.query;
    
    // Build query
    const query = {};
    
    if (specialty) {
      query.specialty = specialty;
    }
    
    if (isAcceptingNewPatients !== undefined) {
      query.isAcceptingNewPatients = isAcceptingNewPatients === 'true';
    }
    
    // Get all doctors with optional filters
    const doctors = await Doctor.find(query).select('name specialty licenseNumber contactInfo availableTimeSlots isAcceptingNewPatients');
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    console.error('Get all doctors error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update appointment with diagnosis after completion
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor/Admin
exports.completeAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with id of ${req.params.id}`
      });
    }

    // Check authorization: Only the doctor or admin can complete an appointment
    if (req.user.role === 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this appointment'
      });
    }

    if (
      req.user.role === 'doctor' &&
      !(await isDoctorOwner(req.user.id, appointment.doctor))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this appointment'
      });
    }

    // Validate required fields
    const { diagnosis, treatmentPlan, prescriptions } = req.body;
    
    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Diagnosis is required to complete an appointment'
      });
    }

    // Update appointment
    const updateData = {
      status: 'completed',
      diagnosis,
      treatmentPlan: treatmentPlan || '',
      prescriptions: prescriptions || [],
      ...req.body // Include any other fields from the request
    };

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('doctor', 'name specialty')
      .populate('patient', 'profile.name');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    console.error('Complete appointment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get medical history for logged-in user
// @route   GET /api/appointments/medical-history
// @access  Private
exports.getMedicalHistory = async (req, res) => {
  try {
    // Find the patient associated with the logged-in user
    const patient = await Patient.findOne({ user: req.user.id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found for this user'
      });
    }

    // Get all completed appointments with diagnosis for this patient
    const appointments = await Appointment.find({ 
      patient: patient._id,
      status: 'completed',
      diagnosis: { $exists: true, $ne: '' } // Only include appointments with a diagnosis
    })
    .populate('doctor', 'name specialty')
    .sort({ date: -1 }); // Most recent first

    // Get all medical history entries for this patient
    const medicalHistoryEntries = await Appointment.find({
      patient: patient._id
    })
    .populate('doctor', 'name specialty')
    .sort({ diagnosisDate: -1 }); // Most recent first

    // Get all medical reports for this patient
    const medicalReports = await MedicalReport.find({
      patient: patient._id
    })
    .populate('doctor', 'name specialty')
    .sort({ date: -1 }); // Most recent first

    // Combine all data into a comprehensive medical history
    const completeHistory = {
      patient: {
        id: patient._id,
        name: patient.profile.name,
        email: patient.profile.email,
        age: patient.profile.age,
        gender: patient.profile.gender,
        bloodType: patient.profile.bloodType || patient.medicalInfo.bloodType
      },
      appointments: appointments.map(appointment => ({
        id: appointment._id,
        date: appointment.date,
        doctor: appointment.doctor,
        diagnosis: appointment.diagnosis,
        treatmentPlan: appointment.treatmentPlan,
        prescriptions: appointment.prescriptions,
        notes: appointment.notes,
        type: 'appointment'
      })),
      conditions: medicalHistoryEntries.map(entry => ({
        id: entry._id,
        condition: entry.condition,
        diagnosisDate: entry.diagnosisDate,
        doctor: entry.doctor,
        status: entry.status,
        category: entry.category,
        treatments: entry.treatments,
        notes: entry.notes,
        type: 'condition'
      })),
      reports: medicalReports.map(report => ({
        id: report._id,
        type: report.type,
        date: report.date,
        doctor: report.doctor,
        category: report.category,
        status: report.status,
        findings: report.findings,
        recommendations: report.recommendations,
        fileURL: report.fileURL,
        type: 'report'
      }))
    };

    // Add chronic conditions from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.chronicConditions) {
      completeHistory.chronicConditions = patient.medicalInfo.chronicConditions;
    }

    // Add allergies from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.allergies) {
      completeHistory.allergies = patient.medicalInfo.allergies;
    }

    // Add current medications from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.medications) {
      completeHistory.currentMedications = patient.medicalInfo.medications;
    }

    res.status(200).json({
      success: true,
      data: completeHistory
    });
  } catch (err) {
    console.error('Get medical history error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get medical history for specific patient (admin/doctor access)
// @route   GET /api/appointments/patients/:patientId/medical-history
// @access  Private/Doctor/Admin
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    // Check authorization: Only doctors or admins can access
    if (req.user.role === 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    const patientId = req.params.patientId;

    // Find the patient
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // If doctor, check if they have an appointment with this patient
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // Check if the doctor has any appointments with this patient
      const hasAppointment = await Appointment.findOne({
        doctor: doctor._id,
        patient: patientId
      });

      if (!hasAppointment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this patient\'s medical history'
        });
      }
    }

    // Get all completed appointments with diagnosis for this patient
    const appointments = await Appointment.find({ 
      patient: patientId,
      status: 'completed',
      diagnosis: { $exists: true, $ne: '' }
    })
    .populate('doctor', 'name specialty')
    .sort({ date: -1 });

    // Get all medical history entries for this patient
    const medicalHistoryEntries = await Appointment.find({
      patient: patientId
    })
    .populate('doctor', 'name specialty')
    .sort({ diagnosisDate: -1 });

    // Get all medical reports for this patient
    const medicalReports = await MedicalReport.find({
      patient: patientId
    })
    .populate('doctor', 'name specialty')
    .sort({ date: -1 });

    // Combine all data into a comprehensive medical history
    const completeHistory = {
      patient: {
        id: patient._id,
        name: patient.profile.name,
        email: patient.profile.email,
        age: patient.profile.age,
        gender: patient.profile.gender,
        bloodType: patient.profile.bloodType || patient.medicalInfo.bloodType
      },
      appointments: appointments.map(appointment => ({
        id: appointment._id,
        date: appointment.date,
        doctor: appointment.doctor,
        diagnosis: appointment.diagnosis,
        treatmentPlan: appointment.treatmentPlan,
        prescriptions: appointment.prescriptions,
        notes: appointment.notes,
        type: 'appointment'
      })),
      conditions: medicalHistoryEntries.map(entry => ({
        id: entry._id,
        condition: entry.condition,
        diagnosisDate: entry.diagnosisDate,
        doctor: entry.doctor,
        status: entry.status,
        category: entry.category,
        treatments: entry.treatments,
        notes: entry.notes,
        type: 'condition'
      })),
      reports: medicalReports.map(report => ({
        id: report._id,
        type: report.type,
        date: report.date,
        doctor: report.doctor,
        category: report.category,
        status: report.status,
        findings: report.findings,
        recommendations: report.recommendations,
        fileURL: report.fileURL,
        type: 'report'
      }))
    };

    // Add chronic conditions from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.chronicConditions) {
      completeHistory.chronicConditions = patient.medicalInfo.chronicConditions;
    }

    // Add allergies from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.allergies) {
      completeHistory.allergies = patient.medicalInfo.allergies;
    }

    // Add current medications from patient profile if available
    if (patient.medicalInfo && patient.medicalInfo.medications) {
      completeHistory.currentMedications = patient.medicalInfo.medications;
    }

    res.status(200).json({
      success: true,
      data: completeHistory
    });
  } catch (err) {
    console.error('Get patient medical history error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Generate slots until we reach end time
  while (currentMinutes < endMinutes) {
    // Format the time slot
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    
    slots.push(`${formattedHour}:${formattedMinute}`);
    
    // Move to next slot
    currentMinutes += durationMinutes;
  }
  
  return slots;
}

exports.addDoctor = async (req, res) => {
  try {
    const {
      user,
      name,
      specialty,
      licenseNumber,
      contactInfo,
      availableTimeSlots,
      profilePicture,
      bio,
      isAcceptingNewPatients
    } = req.body;
    
    // Create doctor
    const doctor = await Doctor.create({
      user,
      name,
      specialty,
      licenseNumber,
      contactInfo,
      availableTimeSlots,
      profilePicture,
      bio,
      isAcceptingNewPatients
    });
    
    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('Add doctor error:', err);
    
    // Handle duplicate license number error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};