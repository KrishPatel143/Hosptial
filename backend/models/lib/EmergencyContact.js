const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required']
  },
  number: {
    type: String,
    required: [true, 'Contact number is required']
  },
  type: {
    type: String,
    enum: ['Emergency Ambulance', 'Hospital', 'Primary Care', 'Personal Contact', 'Specialist', 'Other'],
    default: 'Other'
  },
  icon: {
    type: String,
    enum: ['Ambulance', 'Building2', 'User', 'Phone', 'Heart', 'Medical', 'Other'],
    default: 'User'
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);