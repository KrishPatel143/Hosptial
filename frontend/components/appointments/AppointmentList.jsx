"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Loader2, User } from "lucide-react"
import { StatusBadge } from "./StatusBadge"

export function AppointmentList({ 
  appointments = [], 
  doctors = [],
  onViewDetails,
  onEditAppointment,
  onCompleteAppointment,
  onChangeStatus,
  onCancelAppointment,
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [appointmentTab, setAppointmentTab] = useState("all")
  const [openDropdownId, setOpenDropdownId] = useState(null)

  // Filter appointments based on search term, status filter, and tab
  const filteredAppointments = appointments.filter((appointment) => {
    // Get doctor details
    const doctor = doctors.find(d => d._id === appointment.doctor?._id) || 
                  doctors.find(d => d._id === appointment.doctor) || 
                  { name: "Unknown Doctor", specialty: "Unknown Specialty" };
    
    // Get doctor name (could be in various formats depending on API response)
    const doctorName = appointment.doctor?.name || doctor.name || "Unknown Doctor";
    const doctorSpecialty = appointment.doctor?.specialty || doctor.specialty || "Unknown Specialty";
    
    // Get patient name (could be in various formats depending on API response)
    const patientName = appointment.patient?.profile?.name || "Current Patient";
    
    // Handle search matching
    const matchesSearch =
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.type && appointment.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Handle status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (appointment.status && appointment.status.toLowerCase() === statusFilter.toLowerCase());

    // Handle tab filter
    let matchesTab = true;
    if (appointmentTab !== "all") {
      const formattedTab = appointmentTab.replace(/-/g, " "); // Convert 'in-progress' to 'in progress'
      matchesTab = appointment.status && appointment.status.toLowerCase() === formattedTab;
    }

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Dropdown action handlers
  const handleViewDetails = (appointment) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      onViewDetails && onViewDetails(appointment);
    }, 100);
  };

  const handleEditAppointment = (appointment) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      onEditAppointment && onEditAppointment(appointment);
    }, 100);
  };

  const handleCompleteAppointment = (appointment) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      onCompleteAppointment && onCompleteAppointment(appointment);
    }, 100);
  };

  const handleChangeStatus = (appointmentId, status) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      onChangeStatus && onChangeStatus(appointmentId, status);
    }, 100);
  };

  const handleCancelAppointment = (appointmentId) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      onCancelAppointment && onCancelAppointment(appointmentId);
    }, 100);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Appointment List</CardTitle>
          <CardDescription>Loading appointments...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Appointment List</CardTitle>
            <CardDescription>Manage and view all appointments</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search appointments"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={appointmentTab} onValueChange={setAppointmentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => {
                  // Get doctor details
                  const doctor = doctors.find(d => d._id === appointment.doctor?._id) || 
                                doctors.find(d => d._id === appointment.doctor) || 
                                { name: "Unknown Doctor", specialty: "Unknown Specialty" };
                  
                  // Format the appointment for display
                  const formattedAppointment = {
                    ...appointment,
                    doctorName: appointment.doctor?.name || doctor.name || "Unknown Doctor",
                    doctorSpecialty: appointment.doctor?.specialty || doctor.specialty || "Unknown Specialty",
                    patientName: appointment.patient?.profile?.name || "Current Patient",
                    formattedDate: formatDate(appointment.date)
                  };
                  
                  const appointmentId = appointment._id || `appointment-${Math.random()}`;
                  
                  return (
                    <TableRow key={appointmentId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {formattedAppointment.doctorName?.charAt(0) || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{formattedAppointment.doctorName}</p>
                            <p className="text-xs text-muted-foreground">{formattedAppointment.doctorSpecialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {formattedAppointment.patientName?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{formattedAppointment.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.patient?.profile?.email || "Patient"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>{formattedAppointment.formattedDate}</span>
                          <span className="text-xs text-muted-foreground">{appointment.time || "No time set"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {appointment.type || "Consultation"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status || "scheduled"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu
                          open={openDropdownId === appointmentId}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdownId(appointmentId);
                            } else {
                              setOpenDropdownId(null);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              aria-label={`Actions for appointment with ${formattedAppointment.doctorName}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(appointment)}
                              className="cursor-pointer"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditAppointment(appointment)}
                              className="cursor-pointer"
                            >
                              Edit Appointment
                            </DropdownMenuItem>
                            {/* Complete appointment for scheduled appointments */}
                            {appointment.status !== "completed" && appointment.status === "scheduled" && (
                              <DropdownMenuItem 
                                onClick={() => handleCompleteAppointment(appointment)}
                                className="cursor-pointer"
                              >
                                Complete Appointment
                              </DropdownMenuItem>
                            )}
                            {/* Mark as completed for non-scheduled appointments */}
                            {appointment.status !== "completed" && appointment.status !== "scheduled" && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeStatus(appointment._id, "completed")}
                                className="cursor-pointer"
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {/* Cancel appointment */}
                            {appointment.status !== "canceled" && (
                              <DropdownMenuItem 
                                className="text-destructive cursor-pointer focus:text-destructive"
                                onClick={() => handleCancelAppointment(appointment._id)}
                              >
                                Cancel Appointment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No appointments found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}