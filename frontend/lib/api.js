// Sample appointment data
export const appointments = [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: "2023-11-15",
      time: "09:30 AM",
      category: "Cardiology",
      status: "In Progress",
      notes: "Follow-up on blood pressure medication.",
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 2,
      date: "2023-11-22",
      time: "02:15 PM",
      category: "Orthopedics",
      status: "In Progress",
      notes: "Knee pain assessment and treatment plan.",
    },
    {
      id: 3,
      patientId: 3,
      doctorId: 3,
      date: "2023-10-05",
      time: "11:00 AM",
      category: "Dermatology",
      status: "Completed",
      notes: "Skin rash follow-up, condition improved.",
    },
    {
      id: 4,
      patientId: 4,
      doctorId: 4,
      date: "2023-09-18",
      time: "03:45 PM",
      category: "Neurology",
      status: "Completed",
      notes: "Migraine treatment evaluation.",
    },
    {
      id: 5,
      patientId: 5,
      doctorId: 5,
      date: "2023-11-10",
      time: "10:30 AM",
      category: "Psychiatry",
      status: "Left",
      notes: "Patient did not show up for the appointment.",
    },
  ]
  
  // Default appointment time slots
  export const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ]
  
  // Status options
  export const statusOptions = [
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "left", label: "Left" }
  ]
  // Sample patient data
export const patients = [
    {
      id: 1,
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      patientId: "P10001"
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
      patientId: "P10002"
    },
    {
      id: 3,
      name: "Robert Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      patientId: "P10003"
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      patientId: "P10004"
    },
    {
      id: 5,
      name: "Michael Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      patientId: "P10005"
    }
  ]
  // Sample doctor data
export const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      specialty: "Cardiology"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      specialty: "Orthopedics"
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      specialty: "Dermatology"
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      specialty: "Neurology"
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      avatar: "/placeholder.svg?height=32&width=32", 
      specialty: "Psychiatry"
    }
  ]
  // Medical specialties/categories
export const categories = [
    { value: "cardiology", label: "Cardiology" },
    { value: "dermatology", label: "Dermatology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "psychiatry", label: "Psychiatry" },
    { value: "general", label: "General Medicine" }
  ]
/**
 * Get all appointments
 * @returns {Promise} Promise that resolves to appointments array
 */
export const getAppointments = async () => {
  // In the future, this will be replaced with an API call
  // return fetch('/api/appointments').then(res => res.json());
  return Promise.resolve(appointments);
};

/**
 * Get appointment by ID
 * @param {Number} id - Appointment ID
 * @returns {Promise} Promise that resolves to appointment object
 */
export const getAppointmentById = async (id) => {
  // In the future, this will be replaced with an API call
  // return fetch(`/api/appointments/${id}`).then(res => res.json());
  const appointment = appointments.find(a => a.id === id);
  return Promise.resolve(appointment);
};

/**
 * Get all patients
 * @returns {Promise} Promise that resolves to patients array
 */
export const getPatients = async () => {
  // In the future, this will be replaced with an API call
  // return fetch('/api/patients').then(res => res.json());
  return Promise.resolve(patients);
};

/**
 * Get all doctors
 * @returns {Promise} Promise that resolves to doctors array
 */
export const getDoctors = async () => {
  // In the future, this will be replaced with an API call
  // return fetch('/api/doctors').then(res => res.json());
  return Promise.resolve(doctors);
};

/**
 * Get all categories
 * @returns {Promise} Promise that resolves to categories array
 */
export const getCategories = async () => {
  // In the future, this will be replaced with an API call
  // return fetch('/api/categories').then(res => res.json());
  return Promise.resolve(categories);
};

/**
 * Create a new appointment
 * @param {Object} appointment - Appointment data
 * @returns {Promise} Promise that resolves to created appointment
 */
export const createAppointment = async (appointment) => {
  // In the future, this will be replaced with an API call
  // return fetch('/api/appointments', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(appointment)
  // }).then(res => res.json());
  
  // For now, just return the appointment with a new ID
  return Promise.resolve({ ...appointment, id: appointments.length + 1 });
};

/**
 * Update an existing appointment
 * @param {Number} id - Appointment ID
 * @param {Object} appointment - Updated appointment data
 * @returns {Promise} Promise that resolves to updated appointment
 */
export const updateAppointment = async (id, appointment) => {
  // In the future, this will be replaced with an API call
  // return fetch(`/api/appointments/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(appointment)
  // }).then(res => res.json());
  
  // For now, just return the updated appointment
  return Promise.resolve({ ...appointment, id });
};

/**
 * Delete an appointment
 * @param {Number} id - Appointment ID
 * @returns {Promise} Promise that resolves when appointment is deleted
 */
export const deleteAppointment = async (id) => {
  // In the future, this will be replaced with an API call
  // return fetch(`/api/appointments/${id}`, {
  //   method: 'DELETE'
  // }).then(res => res.json());
  
  // For now, just return success
  return Promise.resolve({ success: true });
};