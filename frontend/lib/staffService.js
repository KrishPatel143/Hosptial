// This file handles all staff data operations
// Currently using static data but structured to easily switch to API calls

import { staffMembers as staticStaffData, apiResponse } from "@/data/staff";

// Mock implementation of staff service using static data
let staffData = [...staticStaffData];

// Helper function to convert from API format to UI format
const convertApiToUiFormat = (apiStaff) => {
  return {
    id: apiStaff._id,
    name: apiStaff.name,
    specialty: apiStaff.specialty,
    specialization: apiStaff.specialty, // Include both fields for compatibility
    licenseNumber: apiStaff.licenseNumber,
    contact: apiStaff.contactInfo.phone,
    email: apiStaff.contactInfo.email,
    address: `${apiStaff.contactInfo.officeAddress.street}, ${apiStaff.contactInfo.officeAddress.city}, ${apiStaff.contactInfo.officeAddress.state} ${apiStaff.contactInfo.officeAddress.postalCode}`,
    experience: apiStaff.experience || "",
    status: apiStaff.status || "Active",
    availability: apiStaff.availableTimeSlots
      ? apiStaff.availableTimeSlots.map(slot => slot.day.slice(0, 3)).join(", ")
      : "",
    profilePicture: "",
    bio: apiStaff.bio || "",
    isAcceptingNewPatients: apiStaff.isAcceptingNewPatients,
    originalData: apiStaff, // Keep the original data for reference
  };
};

// Helper function to convert from UI format to API format
const convertUiToApiFormat = (uiStaff) => {
  // If we have original data, use it as a base
  const originalData = uiStaff.originalData || {};
  
  // Extract city, state, postalCode from address if it exists
  let street = "", city = "", state = "", postalCode = "";
  if (uiStaff.address) {
    const addressParts = uiStaff.address.split(',').map(part => part.trim());
    street = addressParts[0] || "";
    city = addressParts[1] || "";
    
    // The last part might contain both state and postal code
    if (addressParts[2]) {
      const stateZip = addressParts[2].split(' ').filter(Boolean);
      state = stateZip[0] || "";
      postalCode = stateZip.slice(1).join(' ') || "";
    }
  }

  // Build available time slots from availability string
  const availableTimeSlots = [];
  if (uiStaff.availability) {
    const daysMap = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    
    const days = uiStaff.availability.split(',').map(day => day.trim());
    days.forEach(shortDay => {
      const fullDay = daysMap[shortDay] || shortDay;
      const existingSlot = (originalData.availableTimeSlots || []).find(
        slot => slot.day === fullDay
      );
      
      if (existingSlot) {
        availableTimeSlots.push(existingSlot);
      } else {
        availableTimeSlots.push({
          day: fullDay,
          startTime: "09:00",
          endTime: "17:00",
        });
      }
    });
  }

  return {
    _id: uiStaff.id,
    name: uiStaff.name,
    specialty: uiStaff.specialization,
    licenseNumber: uiStaff.licenseNumber,
    contactInfo: {
      officeAddress: {
        street,
        city,
        state,
        postalCode
      },
      email: uiStaff.email,
      phone: uiStaff.contact
    },
    availableTimeSlots,
    isAcceptingNewPatients: uiStaff.isAcceptingNewPatients,
    status: uiStaff.status,
    experience: uiStaff.experience,
    bio: uiStaff.bio
  };
};

// Get all staff members
export const getAllStaff = async () => {
  // This will be replaced with an API call, e.g.,
  // const response = await fetch('/api/doctors');
  // const data = await response.json();
  // return data.data.map(convertApiToUiFormat);
  
  return Promise.resolve(staffData);
};

// Get a staff member by ID
export const getStaffById = async (id) => {
  // This will be replaced with an API call, e.g.,
  // const response = await fetch(`/api/doctors/${id}`);
  // const data = await response.json();
  // return convertApiToUiFormat(data.data);
  
  const staff = staffData.find(staff => staff.id === id);
  return Promise.resolve(staff || null);
};

// Add a new staff member
export const addStaff = async (staffFormData) => {
  // This will be replaced with an API call, e.g.,
  // const apiData = convertUiToApiFormat(staffFormData);
  // const response = await fetch('/api/doctors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(apiData)
  // });
  // const data = await response.json();
  // return convertApiToUiFormat(data.data);
  
  // For now, we'll simulate an API response
  const newId = `new-${Date.now()}`;
  const newStaff = {
    ...staffFormData,
    id: newId,
    originalData: convertUiToApiFormat({
      ...staffFormData,
      id: newId
    }),
  };
  
  staffData.push(newStaff);
  return Promise.resolve(newStaff);
};

// Update an existing staff member
export const updateStaff = async (id, updatedFormData) => {
  // This will be replaced with an API call, e.g.,
  // const apiData = convertUiToApiFormat({...updatedFormData, id});
  // const response = await fetch(`/api/doctors/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(apiData)
  // });
  // const data = await response.json();
  // return convertApiToUiFormat(data.data);
  
  const index = staffData.findIndex(staff => staff.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error("Staff member not found"));
  }
  
  // Update the originalData as well to simulate a complete update
  const updatedStaff = { 
    ...staffData[index], 
    ...updatedFormData,
    originalData: convertUiToApiFormat({
      ...updatedFormData,
      id,
      originalData: staffData[index].originalData
    })
  };
  
  staffData[index] = updatedStaff;
  return Promise.resolve(updatedStaff);
};

// Delete a staff member
export const deleteStaff = async (id) => {
  // This will be replaced with an API call, e.g.,
  // const response = await fetch(`/api/doctors/${id}`, {
  //   method: 'DELETE',
  // });
  // return response.status === 204;
  
  const initialLength = staffData.length;
  staffData = staffData.filter(staff => staff.id !== id);
  
  return Promise.resolve(staffData.length < initialLength);
};

// Filter staff based on search term and status
export const filterStaff = (staff, searchTerm, statusFilter) => {
  return staff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.specialization && staff.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (staff.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      staff.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
};