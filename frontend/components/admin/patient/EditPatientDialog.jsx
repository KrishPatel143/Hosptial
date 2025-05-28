"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPatientForUpdate, updatePatient } from "./patientUtils"

export function EditPatientDialog({ 
  selectedPatient, 
  isEditingPatient, 
  setIsEditingPatient, 
  editedPatient, 
  setEditedPatient,
  isUpdating,
  setIsUpdating,
  patients,
  setPatients
}) {
  // Initialize the edit form when a patient is selected for editing
  useEffect(() => {
    if (selectedPatient && isEditingPatient) {
      setEditedPatient({...selectedPatient})
    }
  }, [selectedPatient, isEditingPatient, setEditedPatient])

  // Handle patient edit form changes
  const handleEditChange = (field, value) => {
    setEditedPatient(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle dialog close
  const handleClose = () => {
    setIsEditingPatient(false)
    setEditedPatient(null)
  }

  // Handle patient update submission
  const handleUpdatePatient = async () => {
    if (!editedPatient || !selectedPatient) return
    
    try {
      setIsUpdating(true)
      
      // Transform the edited data back to the format expected by the API
      const updatedData = formatPatientForUpdate(editedPatient, selectedPatient)

      // Call the update API
      await updatePatient(selectedPatient.id, updatedData)
      
      // Update the local state with the edited patient
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.id === selectedPatient.id 
            ? { 
                ...patient, 
                ...editedPatient,
                originalData: {
                  ...patient.originalData,
                  profile: updatedData.profile,
                  medicalInfo: updatedData.medicalInfo
                }
              } 
            : patient
        )
      )
      
      // Reset states
      handleClose()
      
      // Show success notification (you can add a toast notification library here)
      console.log("Patient updated successfully")
      
    } catch (err) {
      console.error("Failed to update patient:", err)
      // Show error notification
    } finally {
      setIsUpdating(false)
    }
  }

  // Don't render if no patient is selected or not in edit mode
  if (!selectedPatient || !isEditingPatient || !editedPatient) {
    return null
  }

  return (
    <Dialog
      open={!!selectedPatient && isEditingPatient}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="edit-patient-description"
      >
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription id="edit-patient-description">
            Update the patient's information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input 
                id="edit-name" 
                value={editedPatient.name || ""} 
                onChange={(e) => handleEditChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-age">Age</Label>
              <Input 
                id="edit-age" 
                type="number" 
                value={editedPatient.age || ""} 
                onChange={(e) => handleEditChange('age', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select 
                value={editedPatient.gender || ""}
                onValueChange={(value) => handleEditChange('gender', value)}
              >
                <SelectTrigger id="edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">Contact Number</Label>
              <Input 
                id="edit-contact" 
                value={editedPatient.contact || ""} 
                onChange={(e) => handleEditChange('contact', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email" 
                value={editedPatient.email || ""} 
                onChange={(e) => handleEditChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editedPatient.status || ""}
                onValueChange={(value) => handleEditChange('status', value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea 
              id="edit-address" 
              value={editedPatient.address || ""} 
              onChange={(e) => handleEditChange('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-medicalHistory">Medical History</Label>
            <Textarea 
              id="edit-medicalHistory" 
              value={editedPatient.medicalHistory || ""} 
              onChange={(e) => handleEditChange('medicalHistory', e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePatient}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}