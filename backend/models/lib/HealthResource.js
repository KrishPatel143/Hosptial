const mongoose = require('mongoose');

const HealthResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  link: {
    type: String,
    required: [true, 'Resource link is required']
  },
  category: {
    type: String,
    enum: ['COVID-19', 'Mental Health', 'Nutrition', 'Medication', 'Exercise', 'Preventive Care', 'Chronic Conditions', 'General Health', 'Other'],
    default: 'General Health'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthResource', HealthResourceSchema);