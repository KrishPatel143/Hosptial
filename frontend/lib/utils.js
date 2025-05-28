import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


/**
 * Filters appointments based on search term, status, and tab
 * @param {Array} appointments - List of all appointments
 * @param {String} searchTerm - Search term for filtering
 * @param {String} statusFilter - Status filter
 * @param {String} appointmentTab - Selected tab
 * @returns {Array} Filtered appointments
 */
export const filterAppointments = (appointments, searchTerm, statusFilter, appointmentTab, patients, doctors) => {
  return appointments.filter((appointment) => {
    // Find related patient and doctor for search
    const patient = patients.find(p => p.id === appointment.patientId);
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    const patientName = patient ? patient.name : '';
    const doctorName = doctor ? doctor.name : '';

    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesTab =
      appointmentTab === "all" ||
      (appointmentTab === "in-progress" && appointment.status === "In Progress") ||
      (appointmentTab === "left" && appointment.status === "Left") ||
      (appointmentTab === "completed" && appointment.status === "Completed");

    return matchesSearch && matchesStatus && matchesTab;
  });
};

/**
 * Format date string to readable format
 * @param {String} dateString - Date string in YYYY-MM-DD format
 * @returns {String} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Get status badge color based on status
 * @param {String} status - Appointment status
 * @returns {Object} Status badge CSS classes
 */
export const getStatusBadgeColors = (status) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "Left":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

/**
 * Get full appointment data including patient and doctor details
 * @param {Object} appointment - Appointment data
 * @param {Array} patients - List of patients
 * @param {Array} doctors - List of doctors
 * @returns {Object} Full appointment data
 */
export const getFullAppointmentData = (appointment, patients, doctors) => {
  const patient = patients.find(p => p.id === appointment.patientId);
  const doctor = doctors.find(d => d.id === appointment.doctorId);
  
  return {
    ...appointment,
    patientName: patient ? patient.name : 'Unknown',
    patientAvatar: patient ? patient.avatar : '',
    doctorName: doctor ? doctor.name : 'Unknown',
    doctorAvatar: doctor ? doctor.avatar : ''
  };
};

/**
 * Convert time format (e.g. 09:30 AM to 9:30am) for use with Select component
 * @param {String} time - Time string in format HH:MM AM/PM
 * @returns {String} Time string in format h:mmam/pm
 */
export const formatTimeForSelect = (time) => {
  return time.replace(" ", "").toLowerCase();
};

/**
 * Format status for use with Select component
 * @param {String} status - Status string
 * @returns {String} Formatted status string
 */
export const formatStatusForSelect = (status) => {
  return status.toLowerCase().replace(" ", "-");
};