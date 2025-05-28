'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function TimeSelector({ availableSlots, selectedTime, onTimeSelect, disabled = false }) {
  // Group times by morning, afternoon, evening
  const groupedSlots = {
    morning: [],
    afternoon: [],
    evening: []
  };
  
  // Helper to determine time group
  const getTimeGroup = (time) => {
    if (!time) return null;
    
    const hour = parseInt(time.split(':')[0]);
    
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };
  
  // Sort and group available slots
  availableSlots.forEach(slot => {
    const group = getTimeGroup(slot);
    if (group) {
      groupedSlots[group].push(slot);
    }
  });
  
  // Function to format time for display
  const formatTime = (time) => {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':');
      const parsedHours = parseInt(hours);
      const period = parsedHours >= 12 ? 'PM' : 'AM';
      const displayHours = parsedHours % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${displayHours}:${minutes} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return time; // Return original time if parsing fails
    }
  };
  
  // Render time group section
  const renderTimeGroup = (title, slots) => {
    if (!slots.length) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-3 gap-2">
          {slots.map(slot => (
            <Button
              key={slot}
              variant={selectedTime === slot ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full justify-center",
                selectedTime === slot && "bg-primary text-primary-foreground"
              )}
              onClick={() => onTimeSelect(slot)}
              disabled={disabled}
            >
              {formatTime(slot)}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  // If no slots are available
  if (!availableSlots.length) {
    return (
      <div className="p-4 text-center border rounded-md bg-muted/20">
        <p className="text-sm text-muted-foreground">No time slots available for the selected date.</p>
        <p className="text-xs mt-1">Please try selecting a different date.</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[320px] rounded-md border p-4">
      {renderTimeGroup('Morning', groupedSlots.morning)}
      {renderTimeGroup('Afternoon', groupedSlots.afternoon)}
      {renderTimeGroup('Evening', groupedSlots.evening)}
    </ScrollArea>
  );
}