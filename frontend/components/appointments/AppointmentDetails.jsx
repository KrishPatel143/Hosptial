"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarPlus, Clock, Loader2 } from "lucide-react"
import { StatusBadge } from "./StatusBadge"

export function AppointmentDetails({ 
  appointment, 
  onClose, 
  onEdit,
  onChangeStatus,
  onAddNote
}) {                                                                
  const [note, setNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  
  if (!appointment) return null;
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handler for adding a note
  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    setIsAddingNote(true);
    try {
      await onAddNote(note);
      setNote(""); // Clear the input after successful addition
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAddingNote(false);
    }
  };
  
  // Handler for changing status
  const handleChangeStatus = async (status) => {
    setIsChangingStatus(true);
    try {
      await onChangeStatus(status);
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setIsChangingStatus(false);
    }
  };
  
  // Get doctor details
  const doctorName = appointment.doctor?.name || "Unknown Doctor";
  const doctorSpecialty = appointment.doctor?.specialty || "Unknown Specialty";
  
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogDescription>Complete information about the appointment.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{doctorName}</h3>
              <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
            </div>
          </div>
          <StatusBadge status={appointment.status || "scheduled"} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p>{appointment.type || "Consultation"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Patient</p>
            <p>{appointment.patient?.name || "Current User"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
              <p>{formatDate(appointment.date)}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p>{appointment.time || "No time specified"}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Notes</p>
          <div className="mt-1 p-3 bg-muted rounded-md min-h-[80px]">
            {appointment.notes ? (
              <p className="whitespace-pre-line">{appointment.notes}</p>
            ) : (
              <p className="text-muted-foreground">No notes available</p>
            )}
          </div>
        </div>
      { appointment.status != "completed" &&
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                    onClick={() => handleChangeStatus("scheduled")}
                    disabled={isChangingStatus || appointment.status === "scheduled"}
                  >
                    {isChangingStatus && appointment.status !== "scheduled" ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    Scheduled
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                    onClick={() => handleChangeStatus("completed")}
                    disabled={isChangingStatus || appointment.status === "completed"}
                  >
                    {isChangingStatus && appointment.status !== "completed" ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleChangeStatus("canceled")}
                    disabled={isChangingStatus || appointment.status === "canceled"}
                  >
                    {isChangingStatus && appointment.status !== "canceled" ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    Canceled
                  </Button>
                </div>
              </div>
      }
            { appointment.status != "completed" &&
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Add Note</h4>
          <Textarea 
            placeholder="Add a note about this appointment" 
            className="mb-2" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button 
            size="sm" 
            onClick={handleAddNote}
            disabled={!note.trim() || isAddingNote}
          >
            {isAddingNote ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </div>
      }
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>
          Edit Appointment
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}