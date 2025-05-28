  const mongoose = require('mongoose');

  const DoctorSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required']
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true
    },
    contactInfo: {
      email: String,
      phone: String,
      officeAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String
      }
    },
    availableTimeSlots: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,
      endTime: String
    }],
    profilePicture: String,
    bio: String,
    isAcceptingNewPatients: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });

  module.exports = mongoose.model('Doctor', DoctorSchema);