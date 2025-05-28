"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function AppointmentCompletionForm({ 
  appointment, 
  onSave, 
  onCancel 
}) {
  // State for completion form data
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatmentPlan: "",
    prescriptions: [{
      medication: "",
      dosage: "",
      frequency: "",
      duration: ""
    }],
    notes: ""
  })

  // State for UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Common medication frequencies
  const frequencies = [
    "Once daily",
    "Twice daily", 
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime"
  ]

  // Common durations
  const durations = [
    "3 days",
    "5 days", 
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "30 days",
    "60 days",
    "90 days",
    "Until finished",
    "As needed",
    "Ongoing"
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
  }

  // Handle prescription changes
  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...formData.prescriptions]
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      prescriptions: updatedPrescriptions
    }))

    // Clear prescription errors
    if (errors[`prescription_${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`prescription_${index}_${field}`]: null
      }))
    }
  }

  // Add new prescription
  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          medication: "",
          dosage: "",
          frequency: "",
          duration: ""
        }
      ]
    }))
  }

  // Remove prescription
  const removePrescription = (index) => {
    if (formData.prescriptions.length > 1) {
      const updatedPrescriptions = formData.prescriptions.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        prescriptions: updatedPrescriptions
      }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    
    // Validate required fields
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required"
    }
    
    if (!formData.treatmentPlan.trim()) {
      newErrors.treatmentPlan = "Treatment plan is required"
    }

    // Validate prescriptions
    formData.prescriptions.forEach((prescription, index) => {
      if (prescription.medication.trim()) {
        // If medication is provided, other fields become required
        if (!prescription.dosage.trim()) {
          newErrors[`prescription_${index}_dosage`] = "Dosage is required"
        }
        if (!prescription.frequency.trim()) {
          newErrors[`prescription_${index}_frequency`] = "Frequency is required"
        }
        if (!prescription.duration.trim()) {
          newErrors[`prescription_${index}_duration`] = "Duration is required"
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Filter out empty prescriptions
      const validPrescriptions = formData.prescriptions.filter(
        prescription => prescription.medication.trim() !== ""
      )

      // Prepare completion data in the required format
      const completionData = {
        diagnosis: formData.diagnosis.trim(),
        treatmentPlan: formData.treatmentPlan.trim(),
        prescriptions: validPrescriptions,
        notes: formData.notes.trim()
      }
      
      await onSave(completionData)
    } catch (error) {
      console.error("Error completing appointment:", error)
      toast.error("Failed to complete appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Complete Appointment</DialogTitle>
        <DialogDescription>
          Complete the appointment for {appointment.patient?.name || appointment.patient?.profile?.name} 
          on {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        {/* Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis" className="text-sm font-medium">
            Diagnosis *
          </Label>
          <Textarea
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            placeholder="Enter the diagnosis..."
            className={`min-h-[80px] ${errors.diagnosis ? "border-destructive" : ""}`}
            disabled={isSubmitting}
          />
          {errors.diagnosis && (
            <p className="text-destructive text-sm">{errors.diagnosis}</p>
          )}
        </div>

        {/* Treatment Plan */}
        <div className="space-y-2">
          <Label htmlFor="treatmentPlan" className="text-sm font-medium">
            Treatment Plan *
          </Label>
          <Textarea
            id="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={(e) => handleChange('treatmentPlan', e.target.value)}
            placeholder="Enter the treatment plan..."
            className={`min-h-[100px] ${errors.treatmentPlan ? "border-destructive" : ""}`}
            disabled={isSubmitting}
          />
          {errors.treatmentPlan && (
            <p className="text-destructive text-sm">{errors.treatmentPlan}</p>
          )}
        </div>

        {/* Prescriptions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prescriptions</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPrescription}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prescription
            </Button>
          </div>

          {formData.prescriptions.map((prescription, index) => (
            <Card key={index} className="p-4">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Prescription {index + 1}</CardTitle>
                  {formData.prescriptions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePrescription(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medication */}
                  <div className="space-y-2">
                    <Label htmlFor={`medication-${index}`} className="text-sm">
                      Medication
                    </Label>
                    <Input
                      id={`medication-${index}`}
                      value={prescription.medication}
                      onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                      placeholder="e.g., Cetirizine"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Dosage */}
                  <div className="space-y-2">
                    <Label htmlFor={`dosage-${index}`} className="text-sm">
                      Dosage
                    </Label>
                    <Input
                      id={`dosage-${index}`}
                      value={prescription.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      placeholder="e.g., 10mg"
                      className={errors[`prescription_${index}_dosage`] ? "border-destructive" : ""}
                      disabled={isSubmitting}
                    />
                    {errors[`prescription_${index}_dosage`] && (
                      <p className="text-destructive text-sm">
                        {errors[`prescription_${index}_dosage`]}
                      </p>
                    )}
                  </div>

                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor={`frequency-${index}`} className="text-sm">
                      Frequency
                    </Label>
                    <Select
                      value={prescription.frequency}
                      onValueChange={(value) => handlePrescriptionChange(index, 'frequency', value)}
                    >
                      <SelectTrigger 
                        className={errors[`prescription_${index}_frequency`] ? "border-destructive" : ""}
                        disabled={isSubmitting}
                      >
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(freq => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`prescription_${index}_frequency`] && (
                      <p className="text-destructive text-sm">
                        {errors[`prescription_${index}_frequency`]}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${index}`} className="text-sm">
                      Duration
                    </Label>
                    <Select
                      value={prescription.duration}
                      onValueChange={(value) => handlePrescriptionChange(index, 'duration', value)}
                    >
                      <SelectTrigger 
                        className={errors[`prescription_${index}_duration`] ? "border-destructive" : ""}
                        disabled={isSubmitting}
                      >
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map(duration => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`prescription_${index}_duration`] && (
                      <p className="text-destructive text-sm">
                        {errors[`prescription_${index}_duration`]}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional notes or follow-up instructions..."
            className="min-h-[80px]"
            disabled={isSubmitting}
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
              Completing...
            </>
          ) : (
            "Complete Appointment"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}