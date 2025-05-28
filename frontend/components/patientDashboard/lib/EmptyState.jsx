'use client';

import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

export default function EmptyState({ appointmentTab, onRequestAppointment }) {
  // Get appropriate message based on the tab
  const getMessage = () => {
    switch (appointmentTab) {
      case 'upcoming':
        return "You don't have any upcoming appointments scheduled.";
      case 'completed':
        return "You don't have any completed appointments yet.";
      case 'canceled':
        return "You don't have any canceled appointments.";
      default:
        return "No appointments found.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <CalendarPlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">No {appointmentTab} appointments</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {getMessage()}
      </p>
      {appointmentTab === "upcoming" && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRequestAppointment}
        >
          Request Appointment
        </Button>
      )}
    </div>
  );
}