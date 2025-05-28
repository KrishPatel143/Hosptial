"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, User, Stethoscope, Pill, ClipboardList, FileText } from "lucide-react"
import { getMedicalHistory } from "@/utils/api"



const MedicalHistorySection = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [medicalData, setMedicalData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const data = await getMedicalHistory();
        console.log(data.data);
        
        setMedicalData(data.data);
      } catch (error) {
        console.error('Failed to fetch medical history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading medical history...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!medicalData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">Failed to load medical history</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointments = medicalData.appointments || [];

  const filteredHistory = appointments.filter((item) => {
    const matchesSearch =
      (item.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "completed" && item.status === "completed") ||
      (selectedStatus === "ongoing" && item.status !== "completed")

    return matchesSearch && matchesStatus
  })

  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>View your medical appointments and treatments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search diagnosis or doctors..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative border-l border-muted pl-6 ml-3">
            {sortedHistory.length > 0 ? (
              sortedHistory.map((item, index) => (
                <div key={item.id} className={`mb-10 ${index === sortedHistory.length - 1 ? "mb-0" : ""}`}>
                  <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full border border-background bg-muted flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </time>
                  <div className="mt-2">
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          
                          {/* Doctor Information */}
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-blue-600">Doctor</h4>
                              <p className="text-sm">{item.doctor?.name}</p>
                              <p className="text-xs text-muted-foreground">{item.doctor?.specialty}</p>
                            </div>
                          </div>

                          {/* Diagnosis */}
                          {item.diagnosis && (
                            <div className="flex items-start gap-3">
                              <Stethoscope className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-red-600">Diagnosis</h4>
                                <p className="text-sm">{item.diagnosis}</p>
                              </div>
                            </div>
                          )}

                          {/* Treatment Plan */}
                          {item.treatmentPlan && (
                            <div className="flex items-start gap-3">
                              <ClipboardList className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-green-600">Treatment Plan</h4>
                                <p className="text-sm">{item.treatmentPlan}</p>
                              </div>
                            </div>
                          )}

                          {/* Prescriptions */}
                          {item.prescriptions && item.prescriptions.length > 0 && (
                            <div className="flex items-start gap-3">
                              <Pill className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-purple-600 mb-3">Prescriptions</h4>
                                <div className="space-y-3">
                                  {item.prescriptions.map((prescription, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex flex-wrap gap-2 items-center mb-2">
                                        <Badge variant="outline" className="bg-white">
                                          {prescription.medication}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {prescription.dosage}
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div><strong>Frequency:</strong> {prescription.frequency}</div>
                                        <div><strong>Duration:</strong> {prescription.duration}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-orange-600">Notes</h4>
                                <p className="text-sm bg-orange-50 p-3 rounded-lg border-l-4 border-orange-200">
                                  {item.notes}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No medical history records found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalHistorySection;