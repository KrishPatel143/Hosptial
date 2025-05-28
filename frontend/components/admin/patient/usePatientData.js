"use client"

import { useState, useEffect } from "react"
import { fetchPatients } from "./patientUtils"

/**
 * Custom hook for managing patient data and filtering
 */
export function usePatientData() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editedPatient, setEditedPatient] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch patients data when component mounts
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoading(true)
        const patientsData = await fetchPatients()
        setPatients(patientsData)
      } catch (err) {
        setError("Failed to load patients. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPatients()
  }, [])

  // Filter patients based on search term and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact?.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || patient.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return {
    // State
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
    // Computed values
    filteredPatients
  }
}