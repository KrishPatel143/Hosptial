"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { checkUser } from "@/utils/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        setIsLoading(true)
        const userData = await checkUser()
        
        // Check if user exists and has admin role
        if (userData?.data?.role === "admin" ||userData?.data?.role === "doctor" ) {
          setIsAuthorized(true)
        } else {
          // User is not an admin, redirect to unauthorized page or dashboard
          toast.error("Unauthorized Access", {
            description: "You don't have permission to access the admin area.",
          })
          router.push("/") // Redirect to appropriate page for non-admin users
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        toast.error("Authentication Error", {
          description: "Please login to continue.",
        })
        router.push("/login") // Redirect to login if authentication fails
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdminAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // Only render AdminDashboard if user is authorized
  return isAuthorized ? (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  ) : null // We return null here since unauthorized users will be redirected
}