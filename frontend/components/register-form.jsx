"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" 
import Cookies from "js-cookie"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createPatient, registerUser } from "../utils/api" // Assume this is your register API function

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ 
        ...prev, 
        [name]: "" 
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset loading and errors
    setErrors({ name: "", email: "", password: "", confirmPassword: "" })
    setIsLoading(true)

    try {
      // Validate form data using Zod schema
      registerSchema.parse(formData)

      // Attempt to register
      const response = await registerUser(formData)
      
      if (response.success) {
        // Save JWT token to cookies if provided
        if (response.token) {
          Cookies.set('token', response.token, { 
            expires: 1, 
            sameSite: 'strict'
          });
        }
        const respons = await createPatient({profile:{ name :formData.name,email : formData.email }});
        
        // Show success toast
        toast.success("Registration Successful", {
          description: "Redirecting to dashboard...",
        })
        
        // Redirect to home/dashboard
        router.push('/')
      } else {
        // Handle unsuccessful registration
        toast.error("Registration Failed", {
          description: response.message || "Please check your information.",
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const newErrors = { name: "", email: "", password: "", confirmPassword: "" }
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        // Handle network or unexpected errors
        toast.error("Registration Error", {
          description: "An error occurred. Please try again.",
        })
        console.error(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.name ? "true" : "false"}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.email ? "true" : "false"}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.password ? "true" : "false"}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p 
            className="text-sm text-red-500" 
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register"
        )}
      </Button>
    </form>
  )
}