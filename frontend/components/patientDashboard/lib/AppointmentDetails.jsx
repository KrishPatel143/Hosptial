'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, FileText, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppointmentDetails({ appointment, children }) {
  // Safe property access with fallbacks
  const doctorName = appointment?.doctor?.name || 'Unknown Doctor';
  const doctorSpecialty = appointment?.doctor?.specialty || 'No Specialty';
  const doctorEmail = appointment?.doctor?.email || 'No email available';
  const doctorPhone = appointment?.doctor?.phone || 'No phone available';
  const appointmentDate = appointment?.date 
    ? new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'No date';
  const appointmentTime = appointment?.time || 'No time';
  const appointmentType = appointment?.type || 'No reason specified';
  const appointmentStatus = appointment?.status || '';
  const appointmentLocation = appointment?.location || appointment?.doctor?.location || 'Main Clinic';
  const appointmentNotes = appointment?.notes || '';

  // Function to get status badge styling
  const getStatusBadge = () => {
    switch (appointmentStatus) {
      case 'scheduled':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Canceled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return null;
    }
  };

  // Format time for display (e.g., "14:30" -> "2:30 PM")
  const formatTime = (time) => {
    if (!time) return 'No time specified';
    
    try {
      const [hours, minutes] = time.split(':');
      const parsedHours = parseInt(hours);
      const period = parsedHours >= 12 ? 'PM' : 'AM';
      const displayHours = parsedHours % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${displayHours}:${minutes} ${period}`;
    } catch (error) {
      return time; // Return original time if parsing fails
    }
  };

  // Format appointment type for display (e.g., "follow-up" -> "Follow-up")
  const formatAppointmentType = (type) => {
    if (!type) return 'No reason specified';
    
    // Replace hyphens with spaces and capitalize first letter of each word
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            Complete information about your appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Doctor Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Doctor Information</h3>
            <div className="space-y-3 border rounded-lg p-3 bg-muted/10">
              <div className="flex items-start">
                <User className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{doctorName}</p>
                  <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{doctorPhone}</span>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{doctorEmail}</span>
              </div>
            </div>
          </div>
          
          {/* Appointment Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Appointment Information</h3>
            <div className="space-y-3 border rounded-lg p-3 bg-muted/10">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{appointmentDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{formatTime(appointmentTime)}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Reason:</span> {formatAppointmentType(appointmentType)}
                </span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{appointmentLocation}</span>
              </div>
              
              {appointmentNotes && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{appointmentNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}