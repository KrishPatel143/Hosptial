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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PatientDetailsDialog({ 
  selectedPatient, 
  isEditingPatient, 
  setSelectedPatient, 
  setIsEditingPatient 
}) {
  if (!selectedPatient || isEditingPatient) {
    return null
  }

  return (
    <Dialog 
      open={!!selectedPatient && !isEditingPatient} 
      onOpenChange={(open) => !open && setSelectedPatient(null)}
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
              <AvatarFallback className="text-lg">{selectedPatient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{selectedPatient.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
            </div>
            <Badge
              variant={selectedPatient.status === "Active" ? "default" : "secondary"}
              className={`ml-auto ${selectedPatient.status === "Active" ? "bg-green-500" : ""}`}
            >
              {selectedPatient.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{selectedPatient.age}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p>{selectedPatient.gender}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact</p>
            <p>{selectedPatient.contact}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{selectedPatient.address}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Medical History</p>
            <p>{selectedPatient.medicalHistory}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
            <p>{new Date(selectedPatient.lastVisit).toLocaleDateString()}</p>
          </div>


        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setIsEditingPatient(true)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}