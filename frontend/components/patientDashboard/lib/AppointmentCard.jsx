'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Clock, ChevronRight, Info } from 'lucide-react';

// Import the details component
import AppointmentDetails from './AppointmentDetails';

export default function AppointmentCard({ 
  appointment, 
  onCancel, 
  onReschedule, 
  isLoading 
}) {
  // Safe property access with fallbacks
  const doctorName = appointment.doctor?.name || 'Unknown Doctor';
  const doctorSpecialty = appointment.doctor?.specialty || 'No Specialty';
  const appointmentDate = appointment.date 
    ? new Date(appointment.date).toLocaleDateString() 
    : 'No date';
  const appointmentTime = appointment.time || 'No time';
  const appointmentType = appointment.type || '';
  const appointmentStatus = appointment.status || '';
  const appointmentId = appointment._id;

  // Format appointment type for display
  const formatAppointmentType = (type) => {
    if (!type) return '';
    
    // Replace hyphens with spaces and capitalize first letter of each word
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{doctorName}</h3>
              <AppointmentDetails appointment={appointment}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Info className="h-4 w-4" />
                </Button>
              </AppointmentDetails>
            </div>
            <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointmentDate}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="text-sm">{appointmentTime}</span>
            </div>
            {appointmentType && (
              <p className="text-sm mt-1">
                <span className="font-medium">Reason:</span> {formatAppointmentType(appointmentType)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {appointmentStatus === "scheduled" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReschedule(appointment)}
                  disabled={isLoading}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onCancel(appointmentId)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            )}
            {appointmentStatus === "completed" && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Completed
              </Badge>
            )}
            {appointmentStatus === "canceled" && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Canceled
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}