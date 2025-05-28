"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash } from "lucide-react"
import { statusOptions } from "@/data/staff"

export function StaffList({
  staffList,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onViewDetails,
  onEditStaff,
  onDeleteStaff,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null)

  // Dropdown action handlers
  const handleViewDetails = (staff) => {
    setOpenDropdownId(null)
    setTimeout(() => {
      onViewDetails && onViewDetails(staff)
    }, 100)
  }

  const handleEditStaff = (staff) => {
    setOpenDropdownId(null)
    setTimeout(() => {
      onEditStaff && onEditStaff(staff)
    }, 100)
  }

  const handleDeleteStaff = (staff) => {
    setOpenDropdownId(null)
    setTimeout(() => {
      onDeleteStaff && onDeleteStaff(staff)
    }, 100)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>Manage and view all staff members</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search staff members"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Filter staff by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">License Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.length > 0 ? (
                staffList.map((staff) => {
                  const staffId = staff.id || staff._id || `staff-${Math.random()}`
                  
                  return (
                    <TableRow key={staffId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={staff.profilePicture || `/placeholder.svg?height=32&width=32`}
                              alt={staff.name || "Staff member"}
                            />
                            <AvatarFallback>
                              {staff.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "SM"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.name || "Unknown Staff"}</p>
                            <p className="text-xs text-muted-foreground hidden md:block">
                              {staff.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.specialization || staff.specialty || "Not specified"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {staff.contactInfo?.phone || staff.phone || "No contact"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {staff.licenseNumber || "Not provided"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            staff.isAcceptingNewPatients 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : staff.status === false
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {staff.isAcceptingNewPatients ? "Active" : "Leave"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu
                          open={openDropdownId === staffId}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdownId(staffId)
                            } else {
                              setOpenDropdownId(null)
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              aria-label={`Actions for ${staff.name || "staff member"}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(staff)}
                              className="cursor-pointer"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditStaff(staff)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer focus:text-destructive" 
                              onClick={() => handleDeleteStaff(staff)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No staff members found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}