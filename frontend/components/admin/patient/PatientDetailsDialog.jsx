"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"

export function PatientDetailsDialog({ 
  selectedPatient, 
  isEditingPatient, 
  setSelectedPatient, 
  setIsEditingPatient 
}) {
  // Don't render if no patient is selected or if editing
  if (!selectedPatient || isEditingPatient) {
    return null
  }

  const handleClose = () => {
    setSelectedPatient(null)
  }

  const handleEdit = () => {
    setIsEditingPatient(true)
  }

  return (
    <Dialog 
      open={!!selectedPatient && !isEditingPatient} 
      onOpenChange={handleClose}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="patient-details-description"
      >
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription id="patient-details-description">
            Complete information about the patient.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {selectedPatient.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{selectedPatient.name || "Unknown"}</h3>
              <p className="text-sm text-muted-foreground">{selectedPatient.email || "No email"}</p>
            </div>
            <Badge
              variant={selectedPatient.status === "Active" ? "default" : "secondary"}
              className={`ml-auto ${selectedPatient.status === "Active" ? "bg-green-500" : ""}`}
            >
              {selectedPatient.status || "Unknown"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{selectedPatient.age || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p>{selectedPatient.gender || "Not specified"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact</p>
            <p>{selectedPatient.contact || "No contact information"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{selectedPatient.address || "No address provided"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Medical History</p>
            <p>{selectedPatient.medicalHistory || "No medical history available"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
            <p>
              {selectedPatient.lastVisit 
                ? new Date(selectedPatient.lastVisit).toLocaleDateString()
                : "No previous visits"
              }
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}