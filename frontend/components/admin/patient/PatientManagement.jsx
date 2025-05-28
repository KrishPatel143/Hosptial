"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import our component files
import { PatientTable } from "./PatientTable"
import { AddPatientDialog } from "./AddPatientDialog"
import { PatientDetailsDialog } from "./PatientDetailsDialog"
import { EditPatientDialog } from "./EditPatientDialog"
import { usePatientData } from "./usePatientData"

export function PatientManagement() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedPatient,
    setSelectedPatient,
    isAddingPatient,
    setIsAddingPatient,
    isEditingPatient,
    setIsEditingPatient,
    patients,
    setPatients,
    isLoading,
    error,
    editedPatient,
    setEditedPatient,
    isUpdating,
    setIsUpdating,
    filteredPatients
  } = usePatientData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
        <AddPatientDialog 
          isOpen={isAddingPatient} 
          onOpenChange={setIsAddingPatient} 
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>Manage and view all patient records</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search patients"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-[150px]" 
                  aria-label="Filter patients by status"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PatientTable 
            isLoading={isLoading}
            error={error}
            filteredPatients={filteredPatients}
            setSelectedPatient={setSelectedPatient}
            setIsEditingPatient={setIsEditingPatient}
          />
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        selectedPatient={selectedPatient}
        isEditingPatient={isEditingPatient}
        setSelectedPatient={setSelectedPatient}
        setIsEditingPatient={setIsEditingPatient}
      />

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        selectedPatient={selectedPatient}
        isEditingPatient={isEditingPatient}
        setIsEditingPatient={setIsEditingPatient}
        editedPatient={editedPatient}
        setEditedPatient={setEditedPatient}
        isUpdating={isUpdating}
        setIsUpdating={setIsUpdating}
        patients={patients}
        setPatients={setPatients}
      />
    </div>
  )
}