"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// Import API services
import { getAllDoctors, getAllUserData } from "@/utils/api"
import apiClient from "@/utils/api"

export function AppointmentForm({ 
  appointment = null, 
  onSave, 
  onCancel, 
  title = "Create New Appointment",
  description = "Schedule a new appointment with a doctor."
}) {
  // Determine if creating new or editing existing
  const isEditing = !!appointment
  // State for form data
  const [formData, setFormData] = useState({
    doctor: isEditing ? (appointment.doctor?._id || appointment.doctor) : "",
    patient: isEditing ? (appointment.patient?.user || appointment.patient?.user.toISOString() ) : "",
    date: isEditing && appointment.date ? new Date(appointment.date) : new Date(),
    time: isEditing ? appointment.time : "",
    type: isEditing ? appointment.type : "consultation",
    notes: isEditing ? appointment.notes : "",
    status: isEditing ? appointment.status : "scheduled",
    isVirtual: isEditing ? appointment.isVirtual : false
  })

  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Fetch doctors and patients on component mount
  useEffect(() => {
    fetchDoctors()
    fetchPatients()
  }, [])

  // Set specialty based on selected doctor on init
  useEffect(() => {
    if (isEditing && formData.doctor) {
      const selectedDoctor = doctors.find(d => d._id === formData.doctor)
      if (selectedDoctor?.specialty) {
        setSelectedSpecialty(selectedDoctor.specialty.toLowerCase())
      }
    }
  }, [isEditing, formData.doctor, doctors])

  // Fetch available time slots when doctor and date change
  useEffect(() => {
    if (formData.doctor && formData.date) {
      fetchAvailableSlots(formData.doctor, formData.date)
    }
  }, [formData.doctor, formData.date])

  // Fetch available doctors
  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors()
      
      // Check if response has data property and it's an array
      if (response && Array.isArray(response.data)) {
        setDoctors(response.data)
      } else if (response && response.data && Array.isArray(response.data.doctors)) {
        // Handle alternative API response structure
        setDoctors(response.data.doctors)
      } else {
        console.error('Unexpected doctors response format:', response)
        setDoctors([])
      }
    } catch (error) {
      console.error('Fetch doctors error:', error)
      toast.error('Failed to fetch doctors')
      setDoctors([])
    }
  }

  // Fetch available patients
  const fetchPatients = async () => {
    try {
      const response = await getAllUserData()
      
      // Check if response has data property and it's an array
      if (response && Array.isArray(response.data)) {
        setPatients(response.data)
      } else if (response && response.data && Array.isArray(response.data.users)) {
        // Handle alternative API response structure
        setPatients(response.data.users)
      } else if (response && response.data && Array.isArray(response.data.patients)) {
        // Handle another possible API response structure
        setPatients(response.data.patients)
      } else {
        console.error('Unexpected patients response format:', response)
        setPatients([])
      }
    } catch (error) {
      console.error('Fetch patients error:', error)
      toast.error('Failed to fetch patients')
      setPatients([])
    }
  }

  // Fetch available time slots
  const fetchAvailableSlots = async (doctorId, selectedDate) => {
    if (!doctorId || !selectedDate) return

    try {
      setIsLoadingSlots(true)
      
      // Format the date as YYYY-MM-DD for the API
      const formattedDate = selectedDate.toISOString().split('T')[0]
      
      const response = await apiClient.get(`/appointments/doctor/${doctorId}/available-slots`, {
        params: { date: formattedDate }
      })
      
      // Handle different possible response structures
      if (response && response.data && Array.isArray(response.data.availableSlots)) {
        setAvailableSlots(response.data.availableSlots)
      } else if (response && Array.isArray(response.data)) {
        setAvailableSlots(response.data)
      } else if (response && response.data && Array.isArray(response.data.data?.availableSlots)) {
        setAvailableSlots(response.data.data.availableSlots)
      } else {
        // If no slots are returned from the API, use default time slots
        setAvailableSlots(defaultTimeSlots)
        console.error('Unexpected available slots response format:', response)
      }
    } catch (error) {
      console.error('Fetch available slots error:', error)
      // Fall back to default time slots on error
      setAvailableSlots(defaultTimeSlots)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Default appointment types
  const appointmentTypes = [
    { value: "consultation", label: "Consultation" },
    { value: "follow-up", label: "Follow-up" },
    { value: "new-symptoms", label: "New Symptoms" },
    { value: "prescription", label: "Prescription Renewal" },
    { value: "test-results", label: "Test Results Review" }
  ]

  // Default time slots (used as fallback if API fails)
  const defaultTimeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM"
  ]

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
    
    // Handle special case for doctor selection
    if (field === 'doctor' && value) {
      const selectedDoctor = doctors.find(d => d._id === value)
      if (selectedDoctor?.specialty) {
        setSelectedSpecialty(selectedDoctor.specialty.toLowerCase())
      }
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patient) newErrors.patient = "Patient is required"
    if (!formData.doctor) newErrors.doctor = "Doctor is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.type) newErrors.type = "Appointment type is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      // Format date for API
      const formattedDate = formData.date.toISOString().split('T')[0]
      
      // Prepare data for API with the exact structure required
      const appointmentData = {
        patient: formData.patient,
        doctor: formData.doctor,
        date: formattedDate,
        time: formData.time,
        type: formData.type,
        isVirtual: formData.isVirtual,
        notes: formData.notes
      }
      console.log(formData);
      
      // Only include status if editing (for create, let backend set default)
      if (isEditing) {
        appointmentData.status = formData.status
      }
      
      await onSave(appointmentData)
      toast.success(isEditing ? "Appointment updated successfully" : "Appointment created successfully")
    } catch (error) {
      console.error("Error saving appointment:", error)
      toast.error(error.response?.data?.message || "Failed to save appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get unique specialties from doctors
  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))]
    .filter(Boolean)
    .map(specialty => ({
      value: specialty.toLowerCase(),
      label: specialty
    }))

  // Filter doctors by selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter(doctor => doctor.specialty && doctor.specialty.toLowerCase() === selectedSpecialty)
    : doctors

  // Render available time slots
  const renderTimeSlots = () => {
    const slots = availableSlots.length > 0 ? availableSlots : defaultTimeSlots
    
    if (slots.length === 0) {
      return <SelectItem value="no-slots" disabled>No slots available</SelectItem>
    }
    
    return slots.map(slot => (
      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
    ))
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Patient Selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Patient</Label>
          <Select 
            value={formData.patient}
            onValueChange={(value) => handleChange('patient', value)}
          >
            <SelectTrigger 
              className={`col-span-4 md:col-span-3 ${errors.patient ? "border-destructive" : ""}`}
              disabled={isSubmitting}
            >
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(patient => (
                <SelectItem key={patient._id} value={patient._id}>
                  {patient.name || `${patient.profile.name}` || patient.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient && (
            <p className="text-destructive text-sm col-span-4 md:col-span-3 md:col-start-2">
              {errors.patient}
            </p>
          )}
        </div>

        {/* Specialty Selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Specialty</Label>
          <Select 
            value={selectedSpecialty}
            onValueChange={(value) => {
              setSelectedSpecialty(value)
              // Reset doctor when specialty changes
              if (!isEditing || selectedSpecialty !== value) {
                setFormData(prev => ({ ...prev, doctor: "" }))
              }
            }}
          >
            <SelectTrigger className="col-span-4 md:col-span-3" disabled={isSubmitting}>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map(specialty => (
                <SelectItem key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Doctor</Label>
          <Select 
            value={formData.doctor}
            onValueChange={(value) => handleChange('doctor', value)}
          >
            <SelectTrigger 
              className={`col-span-4 md:col-span-3 ${errors.doctor ? "border-destructive" : ""}`}
              disabled={!selectedSpecialty || isSubmitting}
            >
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {filteredDoctors.map(doctor => (
                <SelectItem key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.doctor && (
            <p className="text-destructive text-sm col-span-4 md:col-span-3 md:col-start-2">
              {errors.doctor}
            </p>
          )}
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Appointment Date</Label>
          <div className="col-span-4 md:col-span-3 border rounded-lg p-3">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => handleChange('date', date || new Date())}
              className="mx-auto"
              disabled={(date) => {
                if (!date) return true;
                // Disable weekends and past dates (unless editing an existing appointment)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const day = date.getDay();
                return day === 0 || day === 6 || (!isEditing && date < today);
              }}
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Appointment Time</Label>
          <Select
            value={formData.time}
            onValueChange={(value) => handleChange('time', value)}
          >
            <SelectTrigger 
              className={`col-span-4 md:col-span-3 ${errors.time ? "border-destructive" : ""}`}
              disabled={isSubmitting || isLoadingSlots}
            >
              {isLoadingSlots ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading slots...
                </div>
              ) : (
                <SelectValue placeholder="Select time" />
              )}
            </SelectTrigger>
            <SelectContent>
              {renderTimeSlots()}
            </SelectContent>
          </Select>
          {errors.time && (
            <p className="text-destructive text-sm col-span-4 md:col-span-3 md:col-start-2">
              {errors.time}
            </p>
          )}
        </div>

        {/* Appointment Type */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Appointment Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger 
              className={`col-span-4 md:col-span-3 ${errors.type ? "border-destructive" : ""}`}
              disabled={isSubmitting}
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-destructive text-sm col-span-4 md:col-span-3 md:col-start-2">
              {errors.type}
            </p>
          )}
        </div>

        {/* Virtual Appointment Toggle */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4 md:col-span-1">Virtual Appointment</Label>

        </div>

        {/* Status (only show in edit mode) */}
        {isEditing && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 md:col-span-1">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger className="col-span-4 md:col-span-3" disabled={isSubmitting}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="col-span-4 md:col-span-1 self-start pt-2">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any additional notes or information"
            className="col-span-4 md:col-span-3"
            disabled={isSubmitting}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Save Changes" : "Create Appointment"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}