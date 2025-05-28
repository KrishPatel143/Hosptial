const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'upcoming', 'completed', 'canceled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'new-symptoms', 'prescription', 'test-results'],
    required: true
  },
  diagnosis: {
    type: String,
    default: '' 
  },
  treatmentPlan: {
    type: String,
    default: ''
  },
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries by date
AppointmentSchema.index({ date: 1, time: 1 });
AppointmentSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);  