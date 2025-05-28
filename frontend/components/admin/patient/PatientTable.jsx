"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"

export function PatientTable({ 
  isLoading, 
  error, 
  filteredPatients, 
  setSelectedPatient, 
  setIsEditingPatient 
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p>Loading patient data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Age</TableHead>
            <TableHead className="hidden md:table-cell">Gender</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="hidden md:table-cell">Last Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">{patient.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{patient.age}</TableCell>
                <TableCell className="hidden md:table-cell">{patient.gender}</TableCell>
                <TableCell>{patient.contact}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={patient.status === "Active" ? "default" : "secondary"}
                    className={patient.status === "Active" ? "bg-green-500" : ""}
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsEditingPatient(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No patients found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}