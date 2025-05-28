"use client"

import React, { useEffect } from "react"
import PatientDashboard from "@/components/patientDashboard/patientDashboard";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { checkUser } from "@/utils/api";


export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if token exists in cookies first
        const token = Cookies.get('token');
        
        if (token) {
        
          try {
            const userProfile = await checkUser();  
            if (userProfile) {
              // Token is valid, navigate to home
              router.push('/');
            }
          } catch (error) {
            // Token is invalid, remove it and redirect to login
            console.error('Failed to fetch profile', error);
            Cookies.remove('token');
            router.push('/login');
          }
        }else{

          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error', error);
        // On any error, clear token and redirect to login
        Cookies.remove('token');
        router.push('/login');
      }
    };
  
    checkAuthAndNavigate();
  }, [router]);
  return (
    <div className="min-h-screen bg-background">
      <PatientDashboard />
    </div>

  );
}
