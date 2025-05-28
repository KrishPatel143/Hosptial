"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit } from "lucide-react"

export function StaffDetails({ staff, isOpen, onClose, onEdit }) {
  if (!staff) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogDescription>Complete information about the staff member.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={staff.profilePicture || `/placeholder.svg?height=64&width=64`} alt={staff.name} />
              <AvatarFallback className="text-lg">
                {staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{staff.name}</h3>
              <p className="text-sm text-muted-foreground">{staff.email}</p>
            </div>
            <Badge
              variant="outline"
              className={`ml-auto ${
                staff.status === "Active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : staff.status === "On Leave"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {staff.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Specialization</p>
              <p>{staff.specialization || staff.specialty}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Experience</p>
              <p>{staff.experience}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">License Number</p>
              <p>{staff.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Accepting New Patients
              </p>
              <p>{staff.isAcceptingNewPatients ? "Yes" : "No"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact</p>
            <p>{staff.contact}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{staff.address}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Availability</p>
            {staff.originalData && staff.originalData.availableTimeSlots ? (
              <div className="space-y-1">
                {staff.originalData.availableTimeSlots.map((slot, index) => (
                  <p key={index} className="text-sm">
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </p>
                ))}
              </div>
            ) : (
              <p>{staff.availability}</p>
            )}
          </div>

          {staff.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Biography</p>
              <p className="text-sm">{staff.bio}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Recent Appointments</h4>
            <p className="text-muted-foreground text-center py-4">No recent appointments found.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}