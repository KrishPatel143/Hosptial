import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">Manage your health information in one place</p>
      </div>

    </header>
  );
};

export default DashboardHeader;
