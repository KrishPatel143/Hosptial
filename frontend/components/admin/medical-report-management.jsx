"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Eye, FileText, MoreHorizontal, Search, Upload, Filter } from "lucide-react"
import { toast } from "sonner"
import { medicalReportService, getAllUserData, getAllDoctors } from "@/utils/api"

export function MedicalReportManagement() {
  const [reports, setReports] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)
  const [isUploadingReport, setIsUploadingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [uploadFile, setUploadFile] = useState(null)
  const [newReport, setNewReport] = useState({
    type: "",
    date: "",
    doctor: "", // This will store the doctor ID
    category: "",
    status: "Pending",
    findings: "",
    recommendations: "",
    patient: "", // This will store the patient ID
    file: null
  })

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports()
    fetchPatients()
    fetchDoctors()
  }, [])

  // Fetch reports based on filters
  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const params = {
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      const response = await medicalReportService.getAllReports(params)
      setReports(response.docs || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medical reports",
        variant: "destructive"
      })
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch patients for the dropdown
  const fetchPatients = async () => {
    try {
      setIsLoadingPatients(true)
      const response = await getAllUserData()
      setPatients(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      })
      console.error("Error fetching patients:", error)
    } finally {
      setIsLoadingPatients(false)
    }
  }
  
  // Fetch doctors for the dropdown
  const fetchDoctors = async () => {
    try {
      setIsLoadingDoctors(true)
      const response = await getAllDoctors()
      setDoctors(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive"
      })
      console.error("Error fetching doctors:", error)
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  // Handle file selection for upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setUploadFile(file)
    setNewReport(prev => ({ ...prev, file }))
  }

  // Submit new medical report
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    try {
      // Validate required fields
      if (!newReport.type || !newReport.date || !newReport.file || !newReport.patient || !newReport.doctor) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
      
      // Create and submit report
      const response = await medicalReportService.createReport(newReport)
      
      if (response.success) {
        // Reset form and close dialog
        setNewReport({
          type: "",
          date: "",
          doctor: "",
          category: "",
          status: "Pending",
          findings: "",
          recommendations: "",
          patient: "",
          file: null
        })
        setUploadFile(null)
        setIsUploadingReport(false)
        
        // Refresh reports
        fetchReports()
        
        toast({
          title: "Success",
          description: "Medical report uploaded successfully",
        })
      } else {
        console.error("Error response:", response)
        toast({
          title: "Error",
          description: "Failed to upload medical report",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload medical report",
        variant: "destructive"
      })
    }
  }

  // View report details
  const handleViewReport = async (report) => {
    try {
      const fullReport = await medicalReportService.getReportById(report._id)
      setSelectedReport(fullReport)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch report details",
        variant: "destructive"
      })
    }
  }

  // Download report
  const handleDownloadReport = (report) => {
    if (report.fileURL) {
      const downloadUrl = medicalReportService.getFilePreviewURL(report.fileURL)
      window.open(downloadUrl, '_blank')
    } else {
      toast({
        title: "Error",
        description: "No file available for download",
        variant: "destructive"
      })
    }
  }

  // Delete a report
  const handleDeleteReport = async (report) => {
    try {
      await medicalReportService.deleteReport(report._id)
      toast({
        title: "Success",
        description: "Report deleted successfully",
      })
      fetchReports()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Medical Report Management</h1>
        <Dialog open={isUploadingReport} onOpenChange={setIsUploadingReport}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>Upload a new medical report for a patient.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReport} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient <span className="text-red-500">*</span></Label>
                <Select
                  value={newReport.patient}
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, patient: value }))}
                  required
                >
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPatients ? (
                      <SelectItem value="" disabled>
                        Loading patients...
                      </SelectItem>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.profile.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No patients found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor <span className="text-red-500">*</span></Label>
                <Select
                  value={newReport.doctor}
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, doctor: value }))}
                  required
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                      <SelectItem value="" disabled>
                        Loading doctors...
                      </SelectItem>
                    ) : doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.name || doctor.fullName || `Dr. ${doctor.lastName || ''}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No doctors found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}
                    required
                  >
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="CT Scan">CT Scan</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ECG">ECG</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select
                    value={newReport.category}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                      <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-date">Report Date</Label>
                  <Input
                    id="report-date"
                    type="date"
                    value={newReport.date}
                    onChange={(e) => setNewReport(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Uploaded By</Label>
                  <Input
                    id="doctor"
                    placeholder="Doctor's name"
                    value={newReport.doctor}
                    onChange={(e) => setNewReport(prev => ({ ...prev, doctor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="findings">Findings</Label>
                <Input
                  id="findings"
                  placeholder="Enter findings"
                  value={newReport.findings}
                  onChange={(e) => setNewReport(prev => ({ ...prev, findings: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Input
                  id="recommendations"
                  placeholder="Enter recommendations"
                  value={newReport.recommendations}
                  onChange={(e) => setNewReport(prev => ({ ...prev, recommendations: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <p className="mt-2 text-sm text-muted-foreground">
                        {uploadFile ? uploadFile.name : "Drag and drop your report file, or click to browse"}
                      </p>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG (Max 10MB)</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('file-upload').click()}>
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadingReport(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload Report</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>Manage and view all medical reports</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchReports()}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("all")
                    fetchReports()
                  }}>All Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Laboratory")
                    fetchReports()
                  }}>Laboratory</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Radiology")
                    fetchReports()
                  }}>Radiology</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Cardiology")
                    fetchReports()
                  }}>Cardiology</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Neurology")
                    fetchReports()
                  }}>Neurology</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Gastroenterology")
                    fetchReports()
                  }}>Gastroenterology</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setCategoryFilter("Orthopedic")
                    fetchReports()
                  }}>Orthopedic</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        {console.log(report)
                        }
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{report.patientInfo ? report.patientInfo?.profile.name.charAt(0) : "P"}</AvatarFallback>
                          </Avatar>
                          
                          <span>{report.patientInfo?.profile.name || "Unknown Patient"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(report.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{report.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge 
                          variant={report.status === "Normal" ? "outline" : 
                                  report.status === "Abnormal" ? "destructive" : 
                                  "secondary"}
                        >
                          {report.status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadReport(report)}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteReport(report)}
                              >
                                Delete Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No reports found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {selectedReport?.report?.type} from {selectedReport?.report?.date && new Date(selectedReport.report.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedReport.report?.fileName || 'Medical Report'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.report?.doctor ? `Uploaded by ${selectedReport.report.doctor}` : 'No doctor information'}
                  </p>
                </div>
                <Badge variant="outline">{selectedReport.report?.category}</Badge>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50 min-h-[400px] flex items-center justify-center">
                {selectedReport.report?.fileURL ? (
                  <iframe 
                    src={medicalReportService.getFilePreviewURL(selectedReport.report.fileURL)} 
                    className="w-full h-full min-h-[400px]"
                    title="Report Preview"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No file preview available</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patient</p>
                  <p>
                    {selectedReport?.report?.patientName || 
                     patients.find(p => p._id === selectedReport?.report?.patient)?.profile.name || 
                     'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                  <p>
                    {selectedReport?.report?.doctorName || 
                     (() => {
                       const doctor = doctors.find(d => d._id === selectedReport?.report?.doctor);
                       return doctor ? (doctor.name || doctor.fullName || `Dr. ${doctor.lastName || ''}`) : 'N/A';
                     })() || 
                     'N/A'}
                  </p>
                </div>
              </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                  <p>{selectedReport.report?.patientId || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Report Type</p>
                  <p>{selectedReport.report?.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge 
                    variant={selectedReport.report?.status === "Normal" ? "outline" : 
                            selectedReport.report?.status === "Abnormal" ? "destructive" : 
                            "secondary"}
                  >
                    {selectedReport.report?.status || "Pending"}
                  </Badge>
                </div>
              </div>

              {selectedReport.report?.findings && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Findings</p>
                  <p>{selectedReport.report.findings}</p>
                </div>
              )}

              {selectedReport.report?.recommendations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                  <p>{selectedReport.report.recommendations}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            {selectedReport?.report?.fileURL && (
              <Button onClick={() => handleDownloadReport(selectedReport.report)}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}