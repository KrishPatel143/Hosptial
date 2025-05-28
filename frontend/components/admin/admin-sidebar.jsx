"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, FileText, Menu, Users, X } from "lucide-react"



export function AdminSidebar({ activeSection, setActiveSection }) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "patients", label: "Patient Management", icon: Users },
    { id: "appointments", label: "Appointment Management", icon: Calendar },
    { id: "reports", label: "Medical Reports", icon: FileText },
    { id: "staff", label: "Staff Management", icon: Users },
  ]

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
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 py-4 mb-8">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <h2 className="text-xl font-bold">HealthAdmin</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeSection === item.id ? "bg-primary text-primary-foreground" : "",
                )}
                onClick={() => {
                  setActiveSection(item.id)
                  setIsOpen(false)
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-1">Admin Portal</h3>
              <p className="text-sm text-muted-foreground mb-3">Version 1.0.0</p>
              <Button variant="outline" size="sm" className="w-full">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
