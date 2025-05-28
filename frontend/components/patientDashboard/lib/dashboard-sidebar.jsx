'use client';

import React, { useState } from 'react';
import { User, FileText, Calendar, Phone, Clock, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logoutUser } from '@/utils/api';
import { useRouter } from 'next/navigation';
const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter()
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'emergency', label: 'Emergency & FAQs', icon: Phone },
    { id: 'history', label: 'Medical History', icon: Clock },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 py-4 mb-8">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <h2 className="text-xl font-bold">HealthDash</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  activeTab === item.id ? 'bg-primary text-primary-foreground' : '',
                )}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <div className="bg-muted p-4 rounded-lg">
              <Button variant="outline" onClick={()=>{logoutUser();router.push('/login') }} size="sm" className="w-full">
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
