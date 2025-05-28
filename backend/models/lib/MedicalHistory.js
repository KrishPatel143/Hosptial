const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  condition: {
    type: String,
    required: [true, 'Condition name is required']
  },
  diagnosisDate: {
    type: Date,
    required: [true, 'Diagnosis date is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Resolved', 'In Treatment', 'Monitoring'],
    required: true
  },
  category: {
    type: String,
    enum: ['Cardiovascular', 'Orthopedic', 'Neurological', 'Respiratory', 'Digestive', 'Endocrine', 'Dermatological', 'Psychiatric', 'Surgical', 'Allergy', 'Other'],
    required: true
  },
  notes: String,
  treatments: [{
    name: String,
    startDate: Date,
    endDate: Date,
    dosage: String,
    frequency: String,
    notes: String
  }],
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalReport'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);
