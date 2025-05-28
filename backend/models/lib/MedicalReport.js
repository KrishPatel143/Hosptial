const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const MedicalReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Allergy Test', 'Other']
  },
  date: {
    type: Date,
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  category: {
    type: String,
    enum: ['Laboratory', 'Radiology', 'Cardiology', 'Neurology', 'Gastroenterology', 'Orthopedic', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Critical', 'Pending'],
    default: 'Pending'
  },
  fileURL: {
    type: String,
    required: [true, 'File URL is required']
  },
  mimetype: String,
  size: Number,
  findings: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  },
  isShared: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Handle unknown fields silently
  strict: 'throw' 
});

// Add text index for searching
MedicalReportSchema.index({ 
  type: 'text', 
  findings: 'text', 
  recommendations: 'text' 
});

// Apply mongoose-paginate-v2 plugin
MedicalReportSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('MedicalReport', MedicalReportSchema);