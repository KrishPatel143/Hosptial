    // doctorSeeder.js - Script to add doctors through API
const axios = require('axios');

// Base URL for the API
const API_BASE_URL = 'http://localhost:3334/appointments';

// Sample doctors data
const sampleDoctors = [
  {
    user: "65f8a27d1cc7f98c2a0250a1", // Replace with an actual user ID from your database
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    licenseNumber: 'MED12345',
    contactInfo: {
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      officeAddress: {
        street: '123 Medical Center Blvd',
        city: 'Healthville',
        state: 'CA',
        postalCode: '90210'
      }
    },
    availableTimeSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '12:00' }
    ],
    profilePicture: '/uploads/doctors/john-smith.jpg',
    bio: 'Dr. Smith is a board-certified cardiologist with over 15 years of experience.',
    isAcceptingNewPatients: true
  },
  {
    user: "65f8a27d1cc7f98c2a0250a1", // Replace with an actual user ID
    name: 'Dr. Sarah Johnson',
    specialty: 'Pediatrics',
    licenseNumber: 'MED67890',
    contactInfo: {
      email: 'sarah.johnson@example.com',
      phone: '555-987-6543',
      officeAddress: {
        street: '456 Healing Way',
        city: 'Healthville',
        state: 'CA',
        postalCode: '90211'
      }
    },
    availableTimeSlots: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' }
    ],
    profilePicture: '/uploads/doctors/sarah-johnson.jpg',
    bio: 'Dr. Johnson specializes in pediatric care and has been practicing for 10 years.',
    isAcceptingNewPatients: true
  },
  {
    user: "65f8a27d1cc7f98c2a0250a1", // Replace with an actual user ID
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    licenseNumber: 'MED24680',
    contactInfo: {
      email: 'michael.chen@example.com',
      phone: '555-246-8024',
      officeAddress: {
        street: '789 Brain Street',
        city: 'Healthville',
        state: 'CA',
        postalCode: '90212'
      }
    },
    availableTimeSlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00' }
    ],
    profilePicture: '/uploads/doctors/michael-chen.jpg',
    bio: 'Dr. Chen is a neurologist specializing in headache disorders and stroke prevention.',
    isAcceptingNewPatients: false
  },
  {
    user: "65f8a27d1cc7f98c2a0250a1", // Replace with an actual user ID
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    licenseNumber: 'MED13579',
    contactInfo: {
      email: 'emily.rodriguez@example.com',
      phone: '555-135-7913',
      officeAddress: {
        street: '101 Skin Avenue',
        city: 'Healthville',
        state: 'CA',
        postalCode: '90213'
      }
    },
    availableTimeSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '15:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '15:00' },
      { day: 'Friday', startTime: '09:00', endTime: '15:00' }
    ],
    profilePicture: '/uploads/doctors/emily-rodriguez.jpg',
    bio: 'Dr. Rodriguez is a dermatologist with expertise in both medical and cosmetic dermatology.',
    isAcceptingNewPatients: true
  },
  {
    user: "65f8a27d1cc7f98c2a0250a1", // Replace with an actual user ID
    name: 'Dr. Robert Williams',
    specialty: 'Orthopedics',
    licenseNumber: 'MED97531',
    contactInfo: {
      email: 'robert.williams@example.com',
      phone: '555-975-3197',
      officeAddress: {
        street: '202 Bone Street',
        city: 'Healthville',
        state: 'CA',
        postalCode: '90214'
      }
    },
    availableTimeSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '16:30' },
      { day: 'Wednesday', startTime: '08:30', endTime: '16:30' },
      { day: 'Thursday', startTime: '08:30', endTime: '16:30' }
    ],
    profilePicture: '/uploads/doctors/robert-williams.jpg',
    bio: 'Dr. Williams specializes in sports medicine and joint replacement surgery.',
    isAcceptingNewPatients: true
  }
];

// Function to add a doctor via API
async function addDoctor(doctorData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/doctors`, doctorData);
    console.log(`Successfully added doctor: ${doctorData.name}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error adding doctor ${doctorData.name}:`, error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to add all doctors one by one
async function addAllDoctors() {
  console.log('Starting to add doctors...');
  
  for (const doctor of sampleDoctors) {
    console.log(`Adding doctor: ${doctor.name}`);
    await addDoctor(doctor);
    
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Completed adding doctors');
}

// Execute the function
addAllDoctors().catch(err => {
  console.error('Fatal error:', err);
});