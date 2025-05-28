import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for your API
const API_URL = 'http://localhost:3334';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to set the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      logoutUser();
      // Optionally redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/patient/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    
    // Store token if provided
    if (response.data.token) {
      console.log(response.data.token);
      Cookies.set('token', response.data.token, { 
        expires: 1, 
        sameSite: 'strict' // Helps prevent CSRF attacks
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error', error);
    throw error;
  }
};
// Login API call 
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/patient/login', {
      email,
      password
    });
    
    // Corrected token storage
    if (response.data.token) {
      console.log(response.data.token);
      Cookies.set('token', response.data.token, { 
        expires: 1, 
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict' // Helps prevent CSRF attacks
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

// Get User Profile API call
export const checkUser = async () => {
  try {
    const response = await apiClient.get('/patient/me');
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};

// Get User Data API call
export const createPatient = async (data) => {
  try {
    const response = await apiClient.post('/patient/patients',data);
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};
export const getAllUserData = async () => {
  try {
    const response = await apiClient.get('/patient/patients');
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};
export const getUserData = async () => {
  try {
    const response = await apiClient.get('/patient/detail');
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};
export const UpdateUserData = async (updatedDAta) => {
  try {
    const response = await apiClient.put('/patient/detail',updatedDAta);
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};
export const UpdatePatientById = async (id,updatedData) => {
  try {
    const response = await apiClient.put(`/patient/admin/${id}`,updatedData);
    return response.data;
  } catch (error) {
    console.error('Get profile error', error);
    throw error;
  }
};

// Logout function to remove the token
export const logoutUser = () => {
  Cookies.remove('token');
  // Optionally clear other user-related data
  // localStorage.clear();
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  return !!Cookies.get('token');
};
export const uploadService = {
    // Single file upload
    uploadFile: async (file) => {
      try {
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
  
        // Send file to server
        const response = await apiClient.post('/multer/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    },
  
    // Multiple file upload
    uploadMultipleFiles: async (files) => {
      try {
        // Create FormData object
        const formData = new FormData();
        
        // Append multiple files
        files.forEach((file, index) => {
          formData.append('files', file);
        });
  
        // Send files to server
        const response = await apiClient.post('/multer/upload-multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Multiple file upload error:', error);
        throw error;
      }
    },
  
    // Utility function to get file URL
    getFileUrl: (filename) => {
      return `${API_URL}/multer/uploads/${filename}`;
    }
  };

  
export const medicalReportService = {
    // Create a new medical report
    createReport: async (reportData) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all report fields
        Object.keys(reportData).forEach(key => {
          if (reportData[key] !== null && reportData[key] !== undefined) {
            formData.append(key, reportData[key]);
          }
        });
  
        const response = await apiClient.post('/medical-reports', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Create medical report error:', error);
        throw error;
      }
    },
    createReportByAdmin: async (reportData) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all report fields
        Object.keys(reportData).forEach(key => {
          if (reportData[key] !== null && reportData[key] !== undefined) {
            formData.append(key, reportData[key]);
          }
        });
  
        const response = await apiClient.post('/medical-reports/admin-add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Create medical report error:', error);
        throw error;
      }
    },
  
    // Get medical reports with optional filtering
    getReports: async (params = {}) => {
      try {
        const response = await apiClient.get('/medical-reports', { 
          params: {
            page: 1,
            limit: 10,
            ...params
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Get medical reports error:', error);
        throw error;
      }
    },
  
    getAllReports: async (params = {}) => {
      try {
        console.log("getAllReports");
        
        const response = await apiClient.get('/medical-reports/all', { 
          params: {
            page: 1,
            limit: 10,
            ...params
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Get medical reports error:', error);
        throw error;
      }
    },
  
    // Get a single medical report by ID
    getReportById: async (id) => {
      try {
        const response = await apiClient.get(`/medical-reports/${id}`);
        return response.data;
      } catch (error) {
        console.error('Get medical report error:', error);
        throw error;
      }
    },
  
    // Update an existing medical report
    updateReport: async (id, reportData) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all report fields
        Object.keys(reportData).forEach(key => {
          if (reportData[key] !== null && reportData[key] !== undefined) {
            formData.append(key, reportData[key]);
          }
        });
  
        const response = await apiClient.put(`/medical-reports/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        return response.data;
      } catch (error) {
        console.error('Update medical report error:', error);
        throw error;
      }
    },
  
    // Delete a medical report
    deleteReport: async (id) => {
      try {
        const response = await apiClient.delete(`/medical-reports/${id}`);
        return response.data;
      } catch (error) {
        console.error('Delete medical report error:', error);
        throw error;
      }
    },
  
    // Get file preview URL
    getFilePreviewURL: (fileURL) => {
      return `${API_URL}/${fileURL}`;
    }
};
  export const getAllDoctors = async (params = {}) => {
    try {
      const response = await apiClient.get('/appointments/doctors', { params });
      
      return response.data;
    } catch (error) {
      console.error('Get doctors error', error);
      throw error;
    }
  };
  export const addDoctor = async (data) => {
    try {
      const response = await apiClient.post('/doctors/register', data);
      
      return response.data;
    } catch (error) {
      console.error('Add doctor error', error);
      throw error;
    }
  };
  
  export const updateDoctor = async (id, data) => {
    try {
      const response = await apiClient.put(`/doctors/${id}`, data);
      
      return response.data;
    } catch (error) {
      console.error('Update doctor error', error);
      throw error;
    }
  };
  export const deleteDoctor = async (id) => {
    try {
      const response = await apiClient.delete(`/doctors/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('Update doctor error', error);
      throw error;
    }
  };
  
  // Create a new appointment
    export const createAppointment = async (appointmentData) => {
      try {
        
        const response = await apiClient.post('/appointments/', appointmentData);
        return response.data;
      } catch (error) {
        console.error('Create appointment error', error);
        throw error;  
      }
    };
    
    // Get appointments with optional filtering
    export const getAppointments = async (params = {}) => {
      try {
        const response = await apiClient.get('/appointments/all', { params });
        return response.data;
    } catch (error) {
      console.error('Get appointments error', error);
      throw error;
    }
  };
  
  // Get a single appointment by ID 
  export const getAppointment = async (id) => {
    try {
      const response = await apiClient.get(`/appointments/`);
      return response.data;
    } catch (error) {
      console.error('Get appointment error', error);
      throw error;
    }
  };
  export const getAllAppointment = async () => {
    try {
      const response = await apiClient.get(`/appointments/all`);
      return response.data;
    } catch (error) {
      console.error('Get appointment error', error);
      throw error;
    }
  };
      export const getMedicalHistory = async () => {
        try {
          const response = await apiClient.get(`/appointments/medical-history`);
          return response.data;
        } catch (error) {
          console.error('Get appointment error', error);
          throw error;
        }
      };
  
  // Update an existing appointment
  export const updateAppointment = async (id, appointmentData) => {
    try {
      const response = await apiClient.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Update appointment error', error);
      throw error;
    }
  };
  
  export const completeAppointment = async (id, appointmentData) => {
    try {
      const response = await apiClient.put(`/appointments/${id}/complete`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Update appointment error', error);
      throw error;
    }
  };
  
  // Cancel an appointment
  export const cancelAppointment = async (id) => {
    try {
      const response = await apiClient.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Cancel appointment error', error);
      throw error;
    }
  };
  // Admin create patient API call
export const adminCreatePatient = async (patientData) => {
  try {
    const response = await apiClient.post('/patient/admin-create', patientData);
    return response.data;
  } catch (error) {
    console.error('Admin create patient error', error);
    throw error;
  }
};
  
// Create a new appointment by admin
export const createAppointmentByAdmin = async (appointmentData) => {
  try {
    const response = await apiClient.post('/appointments/admin', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Admin create appointment error', error);
    throw error;
  }
};


// Get all appointments (admin only)
export const getAllAppointmentsAdmin = async () => {
  try {
    const response = await apiClient.get('/appointments/all');
    return response.data;
  } catch (error) {
    console.error('Get all appointments error', error);
    throw error;
  }
};
// Get a single appointment by ID
export const getAppointmentById = async (id) => {
  try {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get appointment error', error);
    throw error;
  }
};

// Update an existing appointment
export const updateAppointmentById = async (id, appointmentData) => {
  try {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Update appointment error', error);
    throw error;
  }
};

// Delete/Cancel an appointment
export const deleteAppointmentById = async (id) => {
  try {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete appointment error', error);
    throw error;
  }
};
export default apiClient;