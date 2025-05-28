"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AppointmentManagement } from "@/components/appointments/AppointmentManagement"
import { MedicalReportManagement } from "@/components/admin/medical-report-management"
import { StaffManagement } from "../staff/StaffManagement"
import { PatientManagement } from "./patient/PatientManagement"
 

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("patients")

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeSection === "patients" && <PatientManagement />}
          {activeSection === "appointments" && <AppointmentManagement />}
          {activeSection === "reports" && <MedicalReportManagement />}
          {activeSection === "staff" && <StaffManagement />}
        </main>
      </div>
    </div>
  )
}
