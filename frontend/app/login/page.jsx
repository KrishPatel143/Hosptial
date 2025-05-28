"use client"

import { useState } from "react"
import RegisterForm from "@/components/register-form"
import LoginForm from "@/components/login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Login() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Hospital</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Welcome back</h2>
                <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
              </div>
              <LoginForm />
              <div className="mt-4 text-center text-sm">
                <p>
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Create an account</h2>
                <p className="text-muted-foreground text-sm">Enter your details to register</p>
              </div>
              <RegisterForm />
              <div className="mt-4 text-center text-sm">
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}