'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import { 
  getAllDoctors, 
  createAppointment, 
  getAppointment, 
  cancelAppointment,
  updateAppointment 
} from '@/utils/api';
import apiClient from '@/utils/api';

export default function AppointmentsSection() {
  const [date, setDate] = useState(new Date());
  const [appointmentTab, setAppointmentTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Fetch appointments and doctors on component mount
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [appointmentTab]);

  // Fetch appointments based on current tab
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      // Make sure we pass the correct status to match backend API
      const response = await getAppointment({ status: appointmentTab });
      
      // Check if response has data property and it's an array
      if (response && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else if (response && response.data && Array.isArray(response.data.appointments)) {
        // Handle alternative API response structure
        setAppointments(response.data.appointments);
      } else {
        console.error('Unexpected appointments response format:', response);
        setAppointments([]);
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Fetch appointments error:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };
  

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
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isRescheduling ? 'Failed to reschedule appointment' : 'Failed to request appointment');
      toast.error(errorMessage);
      console.error('Appointment request error:', error);
    } finally {
      setIsLoading(false);
      setIsRescheduling(false);
      setSelectedAppointmentId(null);
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
    setIsRescheduling(false);
    setSelectedAppointmentId(null);
  };

  // Handle canceling an appointment
  const handleCancelAppointment = async (appointmentId) => {
    // Add confirmation dialog before canceling
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    
    if (!confirmCancel) return;

    if (!appointmentId) return;
    
    try {
      setIsLoading(true);
      await cancelAppointment(appointmentId);
      
      toast.success('Appointment canceled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
      console.error('Cancel appointment error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Handle rescheduling an appointment
  const handleRescheduleAppointment = async (appointment) => {
    if (!appointment || !appointment._id || !appointment.doctor) return;
    
    try {
      // Set rescheduling mode and store appointment ID
      setIsRescheduling(true);
      setSelectedAppointmentId(appointment._id);
      
      // Pre-fill form with appointment data
      const doctorSpecialty = appointment.doctor.specialty?.toLowerCase() || '';
      setSelectedSpecialty(doctorSpecialty);
      setSelectedDoctor(appointment.doctor._id);
      setDate(new Date(appointment.date));
      setSelectedReason(appointment.type || '');
      
      // Fetch available slots for the selected doctor and date
      await fetchAvailableSlots(appointment.doctor._id, new Date(appointment.date));
      
      // Set the current time if available in the slots, otherwise leave empty
      if (appointment.time && availableSlots.includes(appointment.time)) {
        setSelectedTime(appointment.time);
      } else {
        setSelectedTime('');
      }
      
      // Open the dialog
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error preparing reschedule form:', error);
      toast.error('Failed to prepare reschedule form');
      resetForm();
    }
  };

  // Handle dialog close - reset form if closed
  const handleDialogOpenChange = (open) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage your medical appointments</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div className="order-1 md:order-2">
              <Tabs value={appointmentTab} onValueChange={setAppointmentTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="canceled">Canceled</TabsTrigger>
                </TabsList>
                
                <TabsContent value={appointmentTab} className="mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Loading appointments...</p>
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment._id || `appointment-${Math.random()}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-medium">
                        {appointment.doctor?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialty || 'No Specialty'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {appointment.date 
                            ? new Date(appointment.date).toLocaleDateString() 
                            : 'No date'}
                        </span>
                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                        <span className="text-sm">{appointment.time || 'No time'}</span>
                      </div>
                      {appointment.type && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Reason:</span> {appointment.type}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {console.log(appointment)
                      }
                      {appointment.status === "scheduled" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRescheduleAppointment(appointment)}
                            disabled={isLoading}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={isLoading}
                          >
                            Cancel Appointment
                          </Button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                      {appointment.status === "canceled" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Canceled
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <CalendarPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No {appointmentTab} appointments</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {appointmentTab === "upcoming"
                ? "You don't have any upcoming appointments scheduled."
                : appointmentTab === "completed"
                  ? "You don't have any completed appointments yet."
                  : "You don't have any canceled appointments."}
            </p>
            {appointmentTab === "upcoming" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Request Appointment
              </Button>
            )}
          </div>
        )}
      </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 