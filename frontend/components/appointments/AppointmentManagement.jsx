"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { CalendarPlus } from "lucide-react"
import { toast } from "sonner"

// Import components
import { AppointmentList } from "./AppointmentList"
import { AppointmentForm } from "./AppointmentForm"
import { AppointmentDetails } from "./AppointmentDetails"
import { AppointmentCompletionForm } from "./AppointmentCompletionForm"

// Import API functions from your utils/api.js
import { 
  getAppointments, 
  updateAppointment,  
  cancelAppointment,
  getAllDoctors,
  createAppointmentByAdmin,
  completeAppointment
} from "@/utils/api"

export function AppointmentManagement() {
  // State for appointments and UI
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [isEditingAppointment, setIsEditingAppointment] = useState(false)
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch appointments and doctors on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch appointments and doctors in parallel
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        getAppointments(),
        getAllDoctors()
      ])
      
      // Process appointments data
      if (appointmentsResponse && appointmentsResponse.data) {
        setAppointments(Array.isArray(appointmentsResponse.data) 
          ? appointmentsResponse.data 
          : appointmentsResponse.data.appointments || []
        )
      } else {
        setAppointments([])
      }
      
      // Process doctors data
      if (doctorsResponse && doctorsResponse.data) {
        setDoctors(Array.isArray(doctorsResponse.data) 
          ? doctorsResponse.data 
          : doctorsResponse.data.doctors || []
        )
      } else {
        setDoctors([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load appointments. Please try again.")
      toast.error("Failed to load appointments")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for viewing appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsEditingAppointment(false)
    setIsCompletingAppointment(false)
  }

  // Handler for opening edit dialog
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsEditingAppointment(true)
    setIsCompletingAppointment(false)
  }

  // Handler for opening complete appointment dialog
  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCompletingAppointment(true)
    setIsEditingAppointment(false)
  }

  // Handler for saving appointment (create or update)
  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (isEditingAppointment && selectedAppointment) {
        // Update existing appointment
        const response = await updateAppointment(selectedAppointment._id, appointmentData)
        
        // Update local state
        setAppointments(appointments.map(a => 
          a._id === selectedAppointment._id ? response.data : a
        ))
        
        toast.success("Appointment updated successfully")
      } else {
        // Create new appointment
        const response = await createAppointmentByAdmin(appointmentData)
        
        // Update local state
        setAppointments([...appointments, response.data])
        
        toast.success("Appointment created successfully")
      }
      
      // Close dialogs
      setIsAddingAppointment(false)
      setIsEditingAppointment(false)
      setSelectedAppointment(null)
      
      // Refresh appointments
      fetchData()
    } catch (error) {
      console.error("Error saving appointment:", error)
      toast.error(error.response?.data?.message || "Failed to save appointment")
    }
  }

  // Handler for completing appointment
  const handleSaveCompletedAppointment = async (completionData) => {
    try {
      if (!selectedAppointment) {
        throw new Error("No appointment selected")
      }

      // Call the complete appointment API
      const response = await completeAppointment(selectedAppointment._id, completionData)
      
      // Update local state - mark appointment as completed
      setAppointments(appointments.map(a => 
        a._id === selectedAppointment._id 
          ? { ...a, status: 'completed', ...response.data }
          : a
      ))
      
      toast.success("Appointment completed successfully")
      
      // Close dialogs
      setIsCompletingAppointment(false)
      setSelectedAppointment(null)
      
      // Refresh appointments to get latest data
      fetchData()
    } catch (error) {
      console.error("Error completing appointment:", error)
      toast.error(error.response?.data?.message || "Failed to complete appointment")
    }
  }

  // Handler for adding a note to an appointment
  const handleAddNote = async (appointmentId, note) => {
    try {
      // Get the appointment to update
      const appointment = appointments.find(a => a._id === appointmentId)
      if (!appointment) {
        throw new Error("Appointment not found")
      }
      
      // Update appointment with new note
      const updatedNotes = appointment.notes 
        ? `${appointment.notes}\n${note}`
        : note
      
      const updatedAppointment = {
        ...appointment,
        notes: updatedNotes
      }
      
      // Send update to API
      await updateAppointment(appointmentId, { notes: updatedNotes })
      
      // Update local state
      setAppointments(appointments.map(a => 
        a._id === appointmentId 
          ? { ...a, notes: updatedNotes }
          : a
      ))
      
      // Update selected appointment if needed
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment({
          ...selectedAppointment,
          notes: updatedNotes
        })
      }
      
      toast.success("Note added successfully")
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add note")
    }
  }

  // Handler for changing appointment status
  const handleChangeStatus = async (appointmentId, newStatus) => {
    try {
      // Send update to API
      await updateAppointment(appointmentId, { status: newStatus.toLowerCase() })
      
      // Update local state
      setAppointments(appointments.map(a => 
        a._id === appointmentId 
          ? { ...a, status: newStatus.toLowerCase() }
          : a
      ))
      
      // Update selected appointment if needed
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment({
          ...selectedAppointment,
          status: newStatus.toLowerCase()
        })
      }
      
      toast.success(`Appointment status changed to ${newStatus}`)
      
      // Refresh appointments to ensure alignment with backend
      fetchData()
    } catch (error) {
      console.error("Error changing status:", error)
      toast.error("Failed to update appointment status")
    }
  }

  // Handler for canceling an appointment
  const handleCancelAppointment = async (appointmentId) => {
    try {
      // Confirm before canceling
      const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?')
      if (!confirmCancel) return
      
      await cancelAppointment(appointmentId)
      
      // Update local state
      setAppointments(appointments.filter(a => a._id !== appointmentId))
      
      // Close detail view if the canceled appointment was selected
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment(null)
      }
      
      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Error canceling appointment:", error)
      toast.error(error.response?.data?.message || "Failed to cancel appointment")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Appointment Management</h1>
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <Button onClick={() => setIsAddingAppointment(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Appointment
          </Button>
          
          {isAddingAppointment && (
            <AppointmentForm
              onSave={handleSaveAppointment}
              onCancel={() => setIsAddingAppointment(false)}
              doctors={doctors}
            />
          )}
        </Dialog>
      </div>

      {/* Show error message if there was an error loading appointments */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Appointment List */}
      <AppointmentList
        appointments={appointments}
        doctors={doctors}
        onViewDetails={handleViewDetails}
        onEditAppointment={handleEditAppointment}
        onCompleteAppointment={handleCompleteAppointment}
        onChangeStatus={handleChangeStatus}
        onCancelAppointment={handleCancelAppointment}
        isLoading={isLoading}
      />

      {/* Appointment Details Dialog */}
      <Dialog 
        open={!!selectedAppointment && !isEditingAppointment && !isCompletingAppointment} 
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      >
        {selectedAppointment && !isEditingAppointment && !isCompletingAppointment && (
          <AppointmentDetails
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onEdit={() => setIsEditingAppointment(true)}
            onComplete={() => setIsCompletingAppointment(true)}
            onChangeStatus={(status) => handleChangeStatus(selectedAppointment._id, status)}
            onAddNote={(note) => handleAddNote(selectedAppointment._id, note)}
          />
        )}
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog
        open={!!selectedAppointment && isEditingAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingAppointment(false)
            if (!selectedAppointment) setSelectedAppointment(null)
          }
        }}
      >
        {selectedAppointment && isEditingAppointment && (
          <AppointmentForm
            appointment={selectedAppointment}
            onSave={handleSaveAppointment}
            onCancel={() => setIsEditingAppointment(false)}
            title="Edit Appointment"
            description="Update the appointment details."
            doctors={doctors}
          />
        )}
      </Dialog>

      {/* Complete Appointment Dialog */}
      <Dialog
        open={!!selectedAppointment && isCompletingAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setIsCompletingAppointment(false)
            if (!selectedAppointment) setSelectedAppointment(null)
          }
        }}
      >
        {selectedAppointment && isCompletingAppointment && (
          <AppointmentCompletionForm
            appointment={selectedAppointment}
            onSave={handleSaveCompletedAppointment}
            onCancel={() => setIsCompletingAppointment(false)}
          />
        )}
      </Dialog>
    </div>
  )
}