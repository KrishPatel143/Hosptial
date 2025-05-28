"use client"

import { getAllUserData } from "@/utils/api"
import { UpdatePatientById } from "@/utils/api"

/**
 * Helper function to parse address string into object
 * Extracted as a utility to be reused across components
 */
export const parseAddressString = (addressString, defaultCountry = "UK") => {
  try {
    // Assuming format: "street, city, state postalCode"
    const parts = addressString.split(',').map(part => part.trim())
    
    if (parts.length >= 3) {
      const street = parts[0]
      const city = parts[1]
      // Last part might contain "state postalCode"
      const statePostal = parts[2].split(' ')
      const state = statePostal[0]
      const postalCode = statePostal.slice(1).join(' ')
      
      return {
        street,
        city,
        state,
        postalCode,
        country: defaultCountry
      }
    }
    
    // Fallback if parsing fails
    return {
      street: addressString,
      city: "",
      state: "",
      postalCode: "",
      country: defaultCountry
    }
  } catch (e) {
    console.error("Error parsing address:", e)
    return {
      street: addressString,
      city: "",
      state: "",
      postalCode: "",
      country: defaultCountry
    }
  }
}

/**
 * Format patient data from API response to component-friendly format
 */
export const formatPatientData = (patient) => {
  return {
    id: patient._id,
    name: patient.profile.name,
    age: patient.profile.age,
    gender: patient.profile.gender,
    contact: patient.profile.phone,
    email: patient.profile.email,
    address: `${patient.profile.address?.street || ""}, ${patient.profile.address?.city || ""}, ${patient.profile.address?.state || ""} ${patient.profile.address?.postalCode || ""}`,
    medicalHistory: patient.medicalInfo?.chronicConditions?.join(", ") || "",
    allergies: patient.medicalInfo?.allergies?.join(", ") || "",
    lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toISOString().split('T')[0] : "",
    status: "Active", // You may need to adjust this based on your actual data
    bloodType: patient.profile.bloodType || "",
    medications: patient.medicalInfo?.medications || [],
    // Store the original data structure for easier updates
    originalData: patient
  }
}

/**
 * Fetch all patients from the API
 */
export const fetchPatients = async () => {
  try {
    const response = await getAllUserData()
    
    // Check if the API request was successful and contains data
    if (response.success && response.data) {
      // Transform the API data to match the expected format
      return response.data.map(patient => formatPatientData(patient))
    } else {
      throw new Error("Invalid data received from server")
    }
  } catch (err) {
    console.error("Failed to fetch patients:", err)
    throw err
  }
}

/**
 * Format edited patient data to API-friendly format for updates
 */
export const formatPatientForUpdate = (editedPatient, selectedPatient) => {
  return {
    profile: {
      name: editedPatient.name,
      age: parseInt(editedPatient.age),
      gender: editedPatient.gender,
      phone: editedPatient.contact,
      email: editedPatient.email,
      bloodType: editedPatient.bloodType || selectedPatient.bloodType,
      address: {
        // Parse the address if it's in string format
        ...(typeof editedPatient.address === 'string' 
            ? parseAddressString(editedPatient.address, selectedPatient.originalData.profile.address?.country) 
            : selectedPatient.originalData.profile.address)
      }
    },
    medicalInfo: {
      // Parse medical history if it's in string format
      chronicConditions: typeof editedPatient.medicalHistory === 'string' 
          ? editedPatient.medicalHistory.split(', ').filter(item => item.trim() !== '')
          : selectedPatient.originalData.medicalInfo.chronicConditions,
      allergies: selectedPatient.originalData.medicalInfo.allergies,
      medications: selectedPatient.originalData.medicalInfo.medications
    }
  }
}

/**
 * Update a patient in the API
 */
export const updatePatient = async (patientId, updatedData) => {
  try {
    // Ensure id doesn't have a colon prefix
    const cleanId = patientId.replace(':', '')
    return await UpdatePatientById(cleanId, updatedData)
  } catch (err) {
    console.error("Failed to update patient:", err)
    throw err
  }
}