'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import { 
  getAllDoctors, 
  createAppointment, 
  updateAppointment 
} from '@/utils/api';
import apiClient from '@/utils/api';

export default function AppointmentDialog({ 
  isOpen, 
  onOpenChange, 
  isRescheduling, 
  selectedAppointmentDetails,
  fetchAppointments
}) {
  const [date, setDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Set appointment details if rescheduling
  useEffect(() => {
    if (isRescheduling && selectedAppointmentDetails) {
      const { appointmentId, doctorId, doctorSpecialty, appointmentDate, appointmentType, appointmentTime } = selectedAppointmentDetails;
      
      setSelectedAppointmentId(appointmentId);
      setSelectedSpecialty(doctorSpecialty?.toLowerCase() || '');
      setSelectedDoctor(doctorId);
      setDate(new Date(appointmentDate));
      setSelectedReason(appointmentType || '');
      setSelectedTime(appointmentTime || '');
      
      // Fetch available slots for the selected doctor and date
      if (doctorId && appointmentDate) {
        fetchAvailableSlots(doctorId, new Date(appointmentDate));
      }
    }
  }, [isRescheduling, selectedAppointmentDetails]);

  // Fetch available doctors
  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      
      // Check if response has data property and it's an array
      if (response && Array.isArray(response.data)) {
        setDoctors(response.data);
      } else if (response && response.data && Array.isArray(response.data.doctors)) {
        // Handle alternative API response structure
        setDoctors(response.data.doctors);
      } else {
        console.error('Unexpected doctors response format:', response);
        setDoctors([]);
      }
    } catch (error) {
      toast.error('Failed to fetch doctors');
      console.error('Fetch doctors error:', error);
      setDoctors([]);
    }
  };

  // Fetch available time slots when doctor and date are selected
  const fetchAvailableSlots = async (doctorId, selectedDate) => {
    if (!doctorId || !selectedDate) return;

    try {
      // Format the date as YYYY-MM-DD for the API
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const response = await apiClient.get(`/appointments/doctor/${doctorId}/available-slots`, {
        params: { date: formattedDate }
      });
      
      // Handle different possible response structures
      if (response && response.data && Array.isArray(response.data.availableSlots)) {
        setAvailableSlots(response.data.availableSlots);
      } else if (response && Array.isArray(response.data)) {
        setAvailableSlots(response.data);
      } else if (response && response.data && Array.isArray(response.data.data?.availableSlots)) {
        setAvailableSlots(response.data.data.availableSlots);
      } else {
        console.error('Unexpected available slots response format:', response);
        setAvailableSlots([]);
      }
    } catch (error) {
      toast.error('Failed to fetch available time slots');
      console.error('Fetch available slots error:', error);
      setAvailableSlots([]);
    }
  };

  // Handle appointment request submission
  const handleAppointmentRequest = async () => {
    // Validate inputs
    if (!selectedSpecialty || !selectedDoctor || !date || !selectedTime || !selectedReason) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const appointmentData = {
        doctor: selectedDoctor,
        date: date.toISOString().split('T')[0],
        time: selectedTime,
        type: selectedReason
      };

      // If rescheduling, update the existing appointment
      if (isRescheduling && selectedAppointmentId) {
        await updateAppointment(selectedAppointmentId, appointmentData);
        toast.success('Appointment rescheduled successfully');
      } else {
        // Otherwise create a new appointment
        await createAppointment(appointmentData);
        toast.success('Appointment requested successfully');
      }
      
      // Reset form and refresh appointments
      resetForm();
      fetchAppointments();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isRescheduling ? 'Failed to reschedule appointment' : 'Failed to request appointment');
      toast.error(errorMessage);
      console.error('Appointment request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedSpecialty('');
    setSelectedDoctor('');
    setSelectedTime('');
    setSelectedReason('');
    setDate(new Date());
    setAvailableSlots([]);
    setSelectedAppointmentId(null);
  };

  // Filter doctors by selected specialty
  const filteredDoctors = selectedSpecialty 
    ? doctors.filter(doctor => (doctor.specialty || '').toLowerCase() === selectedSpecialty.toLowerCase())
    : doctors;

  // Render available time slots
  const renderTimeSlots = () => {
    if (availableSlots.length === 0) {
      return <SelectItem value="no-slots" disabled>No slots available</SelectItem>;
    }
    
    return availableSlots.map(slot => (
      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Request Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRescheduling ? 'Reschedule Appointment' : 'Request New Appointment'}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to {isRescheduling ? 'reschedule your' : 'request a new'} appointment with a doctor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Specialty Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 md:col-span-1">Specialty</Label>
            <Select 
              value={selectedSpecialty}
              onValueChange={(value) => {
                setSelectedSpecialty(value);
                // Reset doctor if specialty changes
                if (!isRescheduling) {
                  setSelectedDoctor('');
                }
              }}
              disabled={isRescheduling} // Disable if rescheduling
            >
              <SelectTrigger className="col-span-4 md:col-span-3">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {[...new Set(doctors.map(doctor => doctor.specialty))]
                  .filter(Boolean) // Filter out undefined/null values
                  .map(specialty => (
                    <SelectItem key={specialty} value={specialty.toLowerCase()}>
                      {specialty}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 md:col-span-1">Doctor</Label>
            <Select 
              value={selectedDoctor}
              onValueChange={(value) => {
                setSelectedDoctor(value);
                // Fetch available slots when doctor is selected
                if (value) {
                  fetchAvailableSlots(value, date);
                }
              }}
              disabled={!selectedSpecialty || isRescheduling} // Disable if no specialty or rescheduling
            >
              <SelectTrigger className="col-span-4 md:col-span-3">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map(doctor => (
                  <SelectItem key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 md:col-span-1">Preferred Date</Label>
            <div className="col-span-4 md:col-span-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    // Fetch available slots when date changes and doctor is selected
                    if (selectedDoctor) {
                      fetchAvailableSlots(selectedDoctor, newDate);
                    }
                  }
                }}
                className="border rounded-md p-3"
                disabled={(date) => {
                  // Return early if date is null
                  if (!date) return true;
                  
                  const day = date.getDay();
                  // Disable weekends and past dates
                  return day === 0 || day === 6 || date < new Date();
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="col-span-4 md:col-span-1">
              Preferred Time
            </Label>
            <Select 
              value={selectedTime}
              onValueChange={(value) => {
                // Prevent setting "no-slots" as a valid time
                if (value !== 'no-slots') {
                  setSelectedTime(value);
                }
              }}
              disabled={!selectedDoctor || availableSlots.length === 0}
            >
              <SelectTrigger id="time" className="col-span-4 md:col-span-3">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {renderTimeSlots()}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="col-span-4 md:col-span-1">
              Reason
            </Label>
            <Select 
              value={selectedReason}
              onValueChange={setSelectedReason}
            >
              <SelectTrigger id="reason" className="col-span-4 md:col-span-3">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="new-symptoms">New Symptoms</SelectItem>
                <SelectItem value="prescription">Prescription Renewal</SelectItem>
                <SelectItem value="test-results">Test Results Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={handleAppointmentRequest}
            disabled={isLoading}
          >
            {isLoading 
              ? (isRescheduling ? 'Rescheduling...' : 'Requesting...') 
              : (isRescheduling ? 'Reschedule Appointment' : 'Request Appointment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}