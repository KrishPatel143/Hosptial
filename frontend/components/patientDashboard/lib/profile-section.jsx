'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Upload, Plus } from 'lucide-react';
import { getUserData, isAuthenticated } from '@/utils/api';
import { UpdateUserData } from '@/utils/api'; // Import the UpdateUserData function

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false); // Add a loading state for save operation
  const [userId, setUserId] = useState(''); // Store the user ID for updates
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    bloodType: '',
    allergies: [],
    medications: [],
    chronicConditions: [],
    emergencyContacts: []
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
       
        if (!isAuthenticated) {
          throw new Error('Authentication token not found');
        }

        const response = await getUserData();
        
        
        if (response.data) {
          // Use the first patient record (you might want to add a way to select between multiple records)
          const patient = response.data;
          setPatientData(patient);
          setUserId(patient.user || ''); // Store the user ID for updates
          
          // Map the API data to our state format
          setProfileData({
            name: patient.profile.name || '',
            age: patient.profile.age || '',
            gender: patient.profile.gender || '',
            email: patient.profile.email || '',
            phone: patient.profile.phone || '',
            street: patient.profile.address?.street || '',
            city: patient.profile.address?.city || '',
            state: patient.profile.address?.state || '',
            postalCode: patient.profile.address?.postalCode || '',
            country: patient.profile.address?.country || '',
            bloodType: patient.profile.bloodType || '',
            allergies: patient.medicalInfo?.allergies || [],
            medications: patient.medicalInfo?.medications || [],
            chronicConditions: patient.medicalInfo?.chronicConditions || [],
            emergencyContacts: patient.emergencyContacts || []
          });
        } else {
          throw new Error('No patient data found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      // Format the data according to the API structure shown in your example
      const formattedData = {
        user: userId, // Use the stored user ID
        profile: {
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          email: profileData.email,
          phone: profileData.phone,
          bloodType: profileData.bloodType,
          address: {
            street: profileData.street,
            city: profileData.city,
            state: profileData.state,
            postalCode: profileData.postalCode,
            country: profileData.country
          }
        },
        medicalInfo: {
          allergies: profileData.allergies,
          medications: profileData.medications,
          chronicConditions: profileData.chronicConditions
        },
        emergencyContacts: profileData.emergencyContacts
      };

      // Call the UpdateUserData function with the formatted data
      const response = await UpdateUserData(formattedData);
      console.log('Profile updated successfully:', response);
      
      // Update local state with the response if needed
      if (response && response.data) {
        setPatientData(response.data);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} disabled={saveLoading}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile picture" />
                <AvatarFallback className="text-2xl">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Profile Picture</DialogTitle>
                    <DialogDescription>
                      Choose a new profile picture to upload. The file should be an image under 5MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-12">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Drag and drop an image, or click to browse</p>
                      </div>
                    </div>
                    <Input type="file" className="hidden" id="profile-upload" />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          value={profileData.age}
                          onChange={(e) => handleChange('age', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profileData.gender} onValueChange={(value) => handleChange('gender', value)}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select value={profileData.bloodType} onValueChange={(value) => handleChange('bloodType', value)}>
                          <SelectTrigger id="bloodType">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          value={profileData.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={profileData.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Medical Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="allergies">Allergies (comma separated)</Label>
                        <Input
                          id="allergies"
                          value={profileData.allergies.join(', ')}
                          onChange={(e) => handleChange('allergies', e.target.value.split(',').map(item => item.trim()))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chronicConditions">Chronic Conditions (comma separated)</Label>
                        <Input
                          id="chronicConditions"
                          value={profileData.chronicConditions.join(', ')}
                          onChange={(e) => handleChange('chronicConditions', e.target.value.split(',').map(item => item.trim()))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saveLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveLoading}>
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                        <p>{profileData.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                        <p>{profileData.age}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
                        <p>{profileData.gender}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Blood Type</h4>
                        <p>{profileData.bloodType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <p>{profileData.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                        <p>{profileData.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
                    <div>
                      <p>
                        {profileData.street}<br />
                        {profileData.city}, {profileData.state} {profileData.postalCode}<br />
                        {profileData.country}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Allergies</h4>
                        <p>{profileData.allergies.join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Chronic Conditions</h4>
                        <p>{profileData.chronicConditions.join(', ') || 'None'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Medications</h3>
                    {profileData.medications.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.medications.map((med, index) => (
                          <div key={med._id || index} className="p-3 border rounded">
                            <div className="font-medium">{med.name} - {med.dosage}</div>
                            <div className="text-sm text-muted-foreground">
                              Frequency: {med.frequency} | 
                              Started: {new Date(med.startDate).toLocaleDateString()} | 
                              Status: {med.ongoing ? 'Ongoing' : 'Completed'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No medications listed</p>
                    )}
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;