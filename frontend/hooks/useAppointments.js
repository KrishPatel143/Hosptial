'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Import API services
import { getAppointments, cancelAppointment } from '@/utils/api';

export default function useAppointments(statusFilter) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  // Fetch appointments based on current tab
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Make sure we pass the correct status to match backend API
      const response = await getAppointments({ status: statusFilter });
      
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
  }, [statusFilter]);

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
      // Set rescheduling mode and store appointment details
      setIsRescheduling(true);
      
      // Extract and store appointment details
      setSelectedAppointmentDetails({
        appointmentId: appointment._id,
        doctorId: appointment.doctor._id,
        doctorSpecialty: appointment.doctor.specialty,
        appointmentDate: appointment.date,
        appointmentType: appointment.type,
        appointmentTime: appointment.time
      });
      
    } catch (error) {
      console.error('Error preparing reschedule form:', error);
      toast.error('Failed to prepare reschedule form');
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setIsRescheduling(false);
    setSelectedAppointmentDetails(null);
  };

  return {
    appointments,
    isLoading,
    fetchAppointments,
    handleCancelAppointment,
    handleRescheduleAppointment,
    isRescheduling,
    selectedAppointmentDetails,
    resetForm
  };
}