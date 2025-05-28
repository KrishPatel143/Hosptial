/* eslint-disable prettier/prettier */
const User = require('./lib/User');
const Patient = require('./lib/Patient');
const Doctor = require('./lib/Doctor');
const Appointment = require('./lib/Appointment');
const MedicalReport = require('./lib/MedicalReport');
const MedicalHistory = require('./lib/MedicalHistory');
const Notification = require('./lib/Notification');
const FAQ = require('./lib/FAQ');
const EmergencyContact = require('./lib/EmergencyContact');
const HealthResource = require('./lib/HealthResource');

module.exports = {
    User,
    Patient,
    Doctor,
    Appointment,
    MedicalReport,
    MedicalHistory,
    Notification,
    FAQ,
    EmergencyContact,
    HealthResource,
};
