"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"

// Import components
import { StaffList } from "./StaffList"
import { StaffDetails } from "./StaffDetails"
import { StaffForm } from "./StaffForm"
import { DeleteStaffDialog } from "./DeleteStaffDialog"

// Import services and utilities
import { 
  getAllStaff, 
  addStaff, 
  updateStaff, 
  deleteStaff as deleteStaffService,
  filterStaff 
} from "@/lib/staffService"
import { getAllDoctors, addDoctor, updateDoctor, deleteDoctor } from "@/utils/api"

export function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [isEditingStaff, setIsEditingStaff] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch all staff on component mount
  useEffect(() => {
    fetchStaffList()
  }, [])

  // Function to fetch staff list
  const fetchStaffList = async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const response = await getAllDoctors()
      const data = response.data || response // Handle different response structures
      
      // Prepare staff data for the component
      const processedStaff = data.map(doctor => ({
        ...doctor,
        // Ensure all required properties exist
        specialization: doctor.specialty || doctor.specialization,
        contact: doctor.contactInfo?.phone || doctor.contact,
        email: doctor.contactInfo?.email || doctor.email,
        // Store original data for reference when updating
        originalData: doctor
      }))
      
      setStaffList(processedStaff)
    } catch (error) {
      console.error("Error fetching staff:", error)
      setErrorMessage("Failed to load staff list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter staff based on search term and status
  const filteredStaff = filterStaff(staffList, searchTerm, statusFilter)

  // Handler for adding a new staff member
  const handleAddStaff = async (staffData) => {
    try {
      await addDoctor(staffData)
      fetchStaffList() // Refresh the list
      setIsAddingStaff(false)
    } catch (error) {
      console.error("Error adding staff:", error)
      setErrorMessage("Failed to add staff member. Please try again.")
    }
  }

  // Handler for updating a staff member
  const handleUpdateStaff = async (staffData) => {
    if (!selectedStaff) return

    try {
      // Use the doctor's ID from the original data if available
      const id = selectedStaff.originalData?.id || selectedStaff.id
      await updateDoctor(id, staffData)
      fetchStaffList() // Refresh the list
      setIsEditingStaff(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error("Error updating staff:", error)
      setErrorMessage("Failed to update staff member. Please try again.")
    }
  }

  // Handler for deleting a staff member
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return

    try {
      // Use the doctor's ID from the original data if available
      const id = staffToDelete.originalData?.id || staffToDelete.id
      await deleteDoctor(id)
      fetchStaffList() // Refresh the list
      setIsDeleteDialogOpen(false)
      setStaffToDelete(null)
    } catch (error) {
      console.error("Error deleting staff:", error)
      setErrorMessage("Failed to delete staff member. Please try again.")
    }
  }

  // Handler for viewing staff details
  const handleViewDetails = (staff) => {
    setSelectedStaff(staff)
  }

  // Handler for editing staff
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff)
    setIsEditingStaff(true)
  }

  // Handler for initiating delete process
  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <StaffForm 
            onSubmit={handleAddStaff} 
            onCancel={() => setIsAddingStaff(false)} 
          />
        </Dialog>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage("")}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Staff List */
        <StaffList
          staffList={filteredStaff}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewDetails={handleViewDetails}
          onEditStaff={handleEditStaff}
          onDeleteStaff={handleDeleteClick}
        />
      )}

      {/* Staff Details Dialog */}
      <StaffDetails
        staff={selectedStaff}
        isOpen={!!selectedStaff && !isEditingStaff}
        onClose={() => setSelectedStaff(null)}
        onEdit={() => setIsEditingStaff(true)}
      />

      {/* Edit Staff Dialog */}
      <Dialog
        open={!!selectedStaff && isEditingStaff}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingStaff(false)
          }
        }}
      >
        <StaffForm
          staff={selectedStaff}
          isEditing={true}
          onSubmit={handleUpdateStaff}
          onCancel={() => {
            setIsEditingStaff(false)
          }}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteStaffDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setStaffToDelete(null)
        }}
        onConfirm={handleDeleteStaff}
        staffName={staffToDelete?.name}
      />
    </div>
  )
}