'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import  DashboardHeader  from '@/components/patientDashboard/lib/dashboard-header';
import  ProfileSection  from '@/components/patientDashboard/lib/profile-section';
import  DashboardSidebar  from '@/components/patientDashboard/lib/dashboard-sidebar';
import  MedicalReportsSection  from '@/components/patientDashboard/lib/medical-reports-section';
import  AppointmentsSection  from '@/components/patientDashboard/lib/appointments-section';
import EmergencyContactsSection  from '@/components/patientDashboard/lib/emergency-contacts-section';
import MedicalHistorySection from '@/components/patientDashboard/lib/medical-history-section';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-4 md:p-8">
        <DashboardHeader />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="emergency">Emergency & FAQs</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <MedicalReportsSection />
          </TabsContent>
          <TabsContent value="appointments" className="mt-6">
            <AppointmentsSection />
          </TabsContent>
          <TabsContent value="emergency" className="mt-6">
            <EmergencyContactsSection />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <MedicalHistorySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
