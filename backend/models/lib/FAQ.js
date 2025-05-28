const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    unique: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required']
  },
  category: {
    type: String,
    enum: ['General', 'Appointments', 'Medical Reports', 'Account', 'Emergency', 'Privacy', 'Technical'],
    default: 'General'
  },
  order: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('FAQ', FAQSchema);