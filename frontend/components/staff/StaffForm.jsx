"use client"

import { useState, useEffect } from "react"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { specializations, statusOptions } from "@/data/staff"

export function StaffForm({ staff, onSubmit, onCancel, isEditing = false, isRegistration = true }) {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "", // Will map to specialty for API
    contact: "",
    email: "",
    password: "", 
    experience: "",
    status: "active",
    address: "",
    licenseNumber: "",
    bio: "",
    isAcceptingNewPatients: true,
    profilePicture: "",
  })
  
  // State for time slots
  const [timeSlots, setTimeSlots] = useState([])

  useEffect(() => {
    if (staff) {
      // Initialize time slots if available from existing data
      const availableSlots = staff.availableTimeSlots || 
                             staff.originalData?.availableTimeSlots || [];
      
      setTimeSlots(availableSlots.length > 0 ? [...availableSlots] : []);
      
      // Transform API data to form structure
      const availability = staff.availableTimeSlots ? 
        staff.availableTimeSlots.map(slot => slot.day).join(", ") : 
        staff.availability || "";
      
      // Extract contact info from nested structure if available
      const contactPhone = staff.contactInfo?.phone || staff.contact || "";
      const address = staff.contactInfo?.officeAddress ? 
        `${staff.contactInfo.officeAddress.street}, ${staff.contactInfo.officeAddress.city}, ${staff.contactInfo.officeAddress.state} ${staff.contactInfo.officeAddress.postalCode}` : 
        staff.address || "";

      setFormData({
        name: staff.name || "",
        specialization: staff.specialty || staff.specialization || "",
        contact: contactPhone,
        email: staff.contactInfo?.email || staff.email || "",
        password: "", // Password is never populated from existing data
        experience: staff.experience || "",
        status: staff.status?.toLowerCase() || "active",
        address: address,
        licenseNumber: staff.licenseNumber || "",
        bio: staff.bio || "",
        isAcceptingNewPatients: staff.isAcceptingNewPatients ?? true,
        profilePicture: staff.profilePicture || "",
      })
    } else {
      // For new records, initialize with one empty time slot
      setTimeSlots([{ day: "Monday", startTime: "09:00", endTime: "17:00" }]);
    }
  }, [staff])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }
  
  // Function to update formData.availability based on timeSlots
  const updateFormDataFromTimeSlots = (slots) => {
    const availability = slots.map(slot => slot.day).join(", ");
    setFormData(prev => ({ ...prev, availability }));
  }

  const handleSubmit = () => {
    // Transform form data to API structure before submitting
    const apiData = transformFormToApiData(formData, timeSlots);
    onSubmit(apiData);
  }

  // Helper function to transform form data to API structure
  const transformFormToApiData = (formData, timeSlots) => {
    // Parse address into components if possible
    let officeAddress = {
      street: "",
      city: "",
      state: "",
      postalCode: ""
    };
    
    if (formData.address) {
      const addressParts = formData.address.split(',').map(part => part.trim());
      if (addressParts.length >= 3) {
        officeAddress.street = addressParts[0];
        officeAddress.city = addressParts[1];
        
        // The last part might contain state and postal code
        const stateZip = addressParts[addressParts.length - 1].split(' ');
        if (stateZip.length >= 2) {
          officeAddress.state = stateZip[0];
          officeAddress.postalCode = stateZip[1];
        }
      } else {
        // If address format doesn't match expected format, just use as-is
        officeAddress.street = formData.address;
      }
    }
    
    // Create API structure
    const apiData = {
      name: formData.name,
      specialty: formData.specialization, // Map specialization to specialty
      licenseNumber: formData.licenseNumber,
      email: formData.email,
      contactInfo: {
        email: formData.email,
        phone: formData.contact,
        officeAddress: officeAddress
      },
      availableTimeSlots: timeSlots,
      bio: formData.bio,
      isAcceptingNewPatients: formData.isAcceptingNewPatients,
      experience: formData.experience
    };
    
    // Only include password for registration
    if (isRegistration && formData.password) {
      apiData.password = formData.password;
    }
    
    // Include status if it's an edit (not for registration)
    if (!isRegistration) {
      apiData.status = formData.status;
    }
    
    return apiData;
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {isRegistration ? "Doctor Registration" : isEditing ? "Edit Staff Member" : "Add New Staff Member"}
        </DialogTitle>
        <DialogDescription>
          {isRegistration
            ? "Register as a new doctor in the system."
            : isEditing
            ? "Update the staff member's information."
            : "Enter the staff member's information to add them to the system."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => handleSelectChange("specialization", value)}
            >
              <SelectTrigger id="specialization">
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec.value} value={spec.value}>
                    {spec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isRegistration && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              placeholder="Enter contact number"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>
          {!isRegistration && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!isRegistration && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Weekly Availability</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Add a new empty time slot
                    const updatedSlots = [...timeSlots, { day: "Monday", startTime: "09:00", endTime: "17:00" }];
                    setTimeSlots(updatedSlots);
                    updateFormDataFromTimeSlots(updatedSlots);
                  }}
                >
                  Add Time Slot
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto p-2 border rounded-md">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    <Select 
                      value={slot.day}
                      onValueChange={(value) => {
                        const updatedSlots = [...timeSlots];
                        updatedSlots[index] = { ...slot, day: value };
                        setTimeSlots(updatedSlots);
                        updateFormDataFromTimeSlots(updatedSlots);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-1">
                      <Input
                        type="time"
                        className="w-28"
                        value={slot.startTime}
                        onChange={(e) => {
                          const updatedSlots = [...timeSlots];
                          updatedSlots[index] = { ...slot, startTime: e.target.value };
                          setTimeSlots(updatedSlots);
                          updateFormDataFromTimeSlots(updatedSlots);
                        }}
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={slot.endTime}
                        onChange={(e) => {
                          const updatedSlots = [...timeSlots];
                          updatedSlots[index] = { ...slot, endTime: e.target.value };
                          setTimeSlots(updatedSlots);
                          updateFormDataFromTimeSlots(updatedSlots);
                        }}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updatedSlots = timeSlots.filter((_, i) => i !== index);
                        setTimeSlots(updatedSlots);
                        updateFormDataFromTimeSlots(updatedSlots);
                      }}
                      className="ml-auto h-8 w-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
                
                {timeSlots.length === 0 && (
                  <div className="flex justify-center items-center py-6 text-muted-foreground">
                    No available time slots. Click "Add Time Slot" to add one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea 
            id="address" 
            placeholder="Enter full address (e.g., 123 Medical Ave, Healthcare City, HC 12345)" 
            value={formData.address} 
            onChange={handleChange} 
          />
          <p className="text-xs text-muted-foreground">
            Format: Street, City, State PostalCode
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Enter professional biography"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAcceptingNewPatients"
            checked={formData.isAcceptingNewPatients}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isAcceptingNewPatients" className="text-sm font-normal">
            Currently accepting new patients
          </Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {isRegistration 
            ? "Register" 
            : isEditing 
              ? "Save Changes" 
              : "Add Staff"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}