import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye, FileText, Filter, Plus, Search, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { medicalReportService } from "@/utils/api"

export default function MedicalReportsSection() {
  const [reports, setReports] = useState([])
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewReport, setViewReport] = useState(null)
  const [uploadFile, setUploadFile] = useState(null)
  const [newReport, setNewReport] = useState({
    type: "",
    date: "",
    doctor: "",
    category: "",
    status: "",
    findings: "",
    recommendations: "",
    file: null
  })

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports()
  }, [])

  // Fetch reports based on filters
  const fetchReports = async () => {
    try {
      const params = {
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      }
      const response = await medicalReportService.getReports(params)
      setReports(response.docs || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medical reports",
        variant: "destructive"
      })
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
      if (!newReport.type || !newReport.date || !newReport.file) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
      // Create form data
      const formData = new FormData()
      Object.keys(newReport).forEach(key => {
        if (newReport[key] !== null && newReport[key] !== undefined) {
          formData.append(key, newReport[key])
        }
      })
      
      // Submit report
      let response = await medicalReportService.createReport(newReport)
      if (response.success ){
        setOpen(false);
      }else{
        console.log(response);
      }
      // Refresh reports
      fetchReports()
      
      // Reset form and close dialog
      setNewReport({
        type: "",
        date: "",
        doctor: "",
        category: "",
        status: "",
        findings: "",
        recommendations: "",
        file: null
      })
      setUploadFile(null)
      
      toast({
        title: "Success",
        description: "Medical report uploaded successfully",
      })
    } catch (error) {
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
      setViewReport(fullReport)
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
    }
  }

  // Render
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>View and manage your medical reports</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Report
                  </Button>
                </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Medical Report</DialogTitle>
                      <DialogDescription>Upload a new medical report to your health records.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReport} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="report-type" className="col-span-4 md:col-span-1">
                          Report Type
                        </Label>
                        <Select 
                          value={newReport.type}
                          onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger id="report-type" className="col-span-4 md:col-span-3">
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="report-category" className="col-span-4 md:col-span-1">
                          Report category
                        </Label>
                        <Select 
                          value={newReport.category}
                          onValueChange={(value) => setNewReport(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger id="report-type" className="col-span-4 md:col-span-3">
                            <SelectValue placeholder="Select report type" />
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="report-date" className="col-span-4 md:col-span-1">
                          Report Date
                        </Label>
                        <Input 
                          id="report-date" 
                          type="date" 
                          className="col-span-4 md:col-span-3" 
                          value={newReport.date}
                          onChange={(e) => setNewReport(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor-name" className="col-span-4 md:col-span-1">
                          Recommendations
                        </Label>
                        <Input 
                          id="recommendations" 
                          placeholder="Enter recommendations" 
                          className="col-span-4 md:col-span-3"
                          value={newReport.recommendations}
                          onChange={(e) => setNewReport(prev => ({ ...prev, recommendations: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <input 
                            type="file" 
                            className="hidden" 
                            id="file-upload"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.png"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="mt-2 text-sm text-muted-foreground">
                              {uploadFile ? uploadFile.name : "Drag and drop your report file, or click to browse"}
                            </p>
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Upload Report</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
               
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedCategory("all")
                    fetchReports()
                  }}>All Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedCategory("Laboratory")
                    fetchReports()
                  }}>Laboratory</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedCategory("Radiology")
                    fetchReports()
                  }}>Radiology</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedCategory("Cardiology")
                    fetchReports()
                  }}>Cardiology</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports by type or findings..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  fetchReports()
                }}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{report.category}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={report.status === "Normal" ? "outline" : "destructive"}>{report.status || "Pending"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewReport?.type}</DialogTitle>
            <DialogDescription>
              Report from {viewReport && new Date(viewReport.report.date).toLocaleDateString()} 
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Category</p>
                <p>{viewReport?.report.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={viewReport?.report.status === "Normal" ? "outline" : "destructive"}>
                  {viewReport?.report.status || "Pending"}
                </Badge>
              </div>
            </div>
            {viewReport?.report.findings && (
              <div>
                <p className="text-sm font-medium">Findings</p>
                <p>{viewReport.findings}</p>
              </div>
            )}
            {viewReport?.report.recommendations && (
              <div>
                <p className="text-sm font-medium">Recommendations</p>
                <p>{viewReport.recommendations}</p>
              </div>
            )}
            <div className="border rounded-lg p-4 bg-muted/50 min-h-[400px] flex items-center justify-center">

              {viewReport?.report.fileURL ? (
                <iframe 
                  src={medicalReportService.getFilePreviewURL(viewReport?.report.fileURL)} 
                  className="w-full h-full"
                  title="Report Preview"
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No file preview available</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewReport(null)}
            >
              Close
            </Button>
            {viewReport?.report.fileURL && (
              <Button 
                onClick={() => handleDownloadReport(viewReport?.report)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}