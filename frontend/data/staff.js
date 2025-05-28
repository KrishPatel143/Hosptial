// Static staff data matching the API response format
export const apiResponse = {
    "success": true,
    "count": 5,
    "data": [
      {
        "contactInfo": {
          "officeAddress": {
            "street": "123 Medical Center Blvd",
            "city": "Healthville",
            "state": "CA",
            "postalCode": "90210"
          },
          "email": "john.smith@example.com",
          "phone": "555-123-4567"
        },
        "_id": "68179b7144ce962cdfa296fd",
        "name": "Dr. John Smith",
        "specialty": "Cardiology",
        "licenseNumber": "MED12345",
        "availableTimeSlots": [
          {
            "day": "Monday",
            "startTime": "09:00",
            "endTime": "17:00",
            "_id": "68179b7144ce962cdfa296fe"
          },
          {
            "day": "Wednesday",
            "startTime": "09:00",
            "endTime": "17:00",
            "_id": "68179b7144ce962cdfa296ff"
          },
          {
            "day": "Friday",
            "startTime": "09:00",
            "endTime": "12:00",
            "_id": "68179b7144ce962cdfa29700"
          }
        ],
        "isAcceptingNewPatients": true,
        "status": "Active",
        "experience": "15 years",
        "bio": "Dr. Smith is a board-certified cardiologist with extensive experience in treating heart conditions."
      },
      {
        "contactInfo": {
          "officeAddress": {
            "street": "456 Healing Way",
            "city": "Healthville",
            "state": "CA",
            "postalCode": "90211"
          },
          "email": "sarah.johnson@example.com",
          "phone": "555-987-6543"
        },
        "_id": "68179b7b44ce962cdfa29702",
        "name": "Dr. Sarah Johnson",
        "specialty": "Pediatrics",
        "licenseNumber": "MED67890",
        "availableTimeSlots": [
          {
            "day": "Monday",
            "startTime": "08:00",
            "endTime": "16:00",
            "_id": "68179b7b44ce962cdfa29703"
          },
          {
            "day": "Tuesday",
            "startTime": "08:00",
            "endTime": "16:00",
            "_id": "68179b7b44ce962cdfa29704"
          },
          {
            "day": "Thursday",
            "startTime": "08:00",
            "endTime": "16:00",
            "_id": "68179b7b44ce962cdfa29705"
          }
        ],
        "isAcceptingNewPatients": true,
        "status": "Active",
        "experience": "10 years",
        "bio": "Dr. Johnson is a pediatrician who specializes in childhood development and wellness."
      },
      {
        "contactInfo": {
          "officeAddress": {
            "street": "789 Brain Street",
            "city": "Healthville",
            "state": "CA",
            "postalCode": "90212"
          },
          "email": "michael.chen@example.com",
          "phone": "555-246-8024"
        },
        "_id": "68179b9544ce962cdfa29707",
        "name": "Dr. Michael Chen",
        "specialty": "Neurology",
        "licenseNumber": "MED24680",
        "availableTimeSlots": [
          {
            "day": "Tuesday",
            "startTime": "10:00",
            "endTime": "18:00",
            "_id": "68179b9544ce962cdfa29708"
          },
          {
            "day": "Thursday",
            "startTime": "10:00",
            "endTime": "18:00",
            "_id": "68179b9544ce962cdfa29709"
          }
        ],
        "isAcceptingNewPatients": false,
        "status": "On Leave",
        "experience": "12 years",
        "bio": "Dr. Chen specializes in neurological disorders and has conducted extensive research in the field."
      },
      {
        "contactInfo": {
          "officeAddress": {
            "street": "101 Skin Avenue",
            "city": "Healthville",
            "state": "CA",
            "postalCode": "90213"
          },
          "email": "emily.rodriguez@example.com",
          "phone": "555-135-7913"
        },
        "_id": "68179b9e44ce962cdfa2970b",
        "name": "Dr. Emily Rodriguez",
        "specialty": "Dermatology",
        "licenseNumber": "MED13579",
        "availableTimeSlots": [
          {
            "day": "Monday",
            "startTime": "09:00",
            "endTime": "15:00",
            "_id": "68179b9e44ce962cdfa2970c"
          },
          {
            "day": "Wednesday",
            "startTime": "09:00",
            "endTime": "15:00",
            "_id": "68179b9e44ce962cdfa2970d"
          },
          {
            "day": "Friday",
            "startTime": "09:00",
            "endTime": "15:00",
            "_id": "68179b9e44ce962cdfa2970e"
          }
        ],
        "isAcceptingNewPatients": true,
        "status": "Active",
        "experience": "8 years",
        "bio": "Dr. Rodriguez is an expert in treating various skin conditions and cosmetic procedures."
      },
      {
        "contactInfo": {
          "officeAddress": {
            "street": "202 Bone Street",
            "city": "Healthville",
            "state": "CA",
            "postalCode": "90214"
          },
          "email": "robert.williams@example.com",
          "phone": "555-975-3197"
        },
        "_id": "68179baa44ce962cdfa29715",
        "name": "Dr. Robert Williams",
        "specialty": "Orthopedics",
        "licenseNumber": "MED97531",
        "availableTimeSlots": [
          {
            "day": "Tuesday",
            "startTime": "08:30",
            "endTime": "16:30",
            "_id": "68179baa44ce962cdfa29716"
          },
          {
            "day": "Wednesday",
            "startTime": "08:30",
            "endTime": "16:30",
            "_id": "68179baa44ce962cdfa29717"
          },
          {
            "day": "Thursday",
            "startTime": "08:30",
            "endTime": "16:30",
            "_id": "68179baa44ce962cdfa29718"
          }
        ],
        "isAcceptingNewPatients": true,
        "status": "Active",
        "experience": "9 years",
        "bio": "Dr. Williams specializes in sports injuries and joint replacements."
      }
    ]
  };
  
  // Export the data only for easier consumption by components
  export const staffMembers = apiResponse.data.map(staff => ({
    id: staff._id,
    name: staff.name,
    specialty: staff.specialty,
    specialization: staff.specialty, // Include both fields for compatibility
    licenseNumber: staff.licenseNumber,
    contact: staff.contactInfo.phone,
    email: staff.contactInfo.email,
    address: `${staff.contactInfo.officeAddress.street}, ${staff.contactInfo.officeAddress.city}, ${staff.contactInfo.officeAddress.state} ${staff.contactInfo.officeAddress.postalCode}`,
    experience: staff.experience || "",
    status: staff.status || "Active",
    availability: staff.availableTimeSlots
      ? staff.availableTimeSlots.map(slot => slot.day.slice(0, 3)).join(", ")
      : "",
    profilePicture: "",
    bio: staff.bio || "",
    isAcceptingNewPatients: staff.isAcceptingNewPatients,
    // Keep the original data for reference
    originalData: staff,
  }));
  
  // List of available specializations for dropdown menus
  export const specializations = [
    { value: "Cardiology", label: "Cardiology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "Neurology", label: "Neurology" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Psychiatry", label: "Psychiatry" },
    { value: "General", label: "General Medicine" },
  ];
  
  // List of staff status options
  export const statusOptions = [
    { value: "active", label: "Active" },
    { value: "on leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
  ];