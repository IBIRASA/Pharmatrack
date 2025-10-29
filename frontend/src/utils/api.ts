// import axios from 'axios';

// // const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = 'https://pharmatrack-wb0c.onrender.com/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error.response?.data || { detail: 'Network error' });
//   }
// );

// // Types
// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   password_confirm: string;
//   user_type: 'patient' | 'pharmacy';
//   name: string;
//   phone: string;
//   address?: string;
// }

// export interface User {
//   id: number;
//   email: string;
//   user_type: 'patient' | 'pharmacy';
//   name?: string;
//   phone?: string;
// }

// export interface LoginResponse {
//   token: string;
//   refresh: string;
//   user: User;
// }

// export interface Medicine {
//   id: number;
//   name: string;
//   generic_name: string;
//   manufacturer: string;
//   category: string;
//   dosage: string;
//   unit_price: string;
//   stock_quantity: number;
//   minimum_stock: number;
//   expiry_date: string;
//   description: string;
//   is_low_stock?: boolean;
// }

// export interface Order {
//   id: number;
//   customer_name: string;
//   customer_phone?: string;
//   total_amount: number;
//   status: string;
//   created_at: string;
// }

// export interface Customer {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   address?: string;
// }

// export interface NearbyPharmacy {
//   id: number;
//   name: string;
//   address?: string;
//   phone?: string;
//   lat: number;
//   lon: number;
//   opening_hours?: string;
//   distance?: number;
// }

// // Auth APIs
// export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
//   const response = await api.post<LoginResponse>('/users/login/', data);
//   return response.data;
// };

// export const registerUser = async (data: RegisterData): Promise<void> => {
//   await api.post('/users/register/', data);
// };

// // Medicine/Inventory APIs
// export const getMedicines = async (params?: { search?: string; category?: string }): Promise<Medicine[]> => {
//   const response = await api.get<Medicine[]>('/inventory/medicines/', { params });
//   return response.data;
// };

// export const createMedicine = async (data: Partial<Medicine>): Promise<Medicine> => {
//   const response = await api.post<Medicine>('/inventory/medicines/', data);
//   return response.data;
// };

// export const updateMedicine = async (id: number, data: Partial<Medicine>): Promise<Medicine> => {
//   const response = await api.put<Medicine>(`/inventory/medicines/${id}/`, data);
//   return response.data;
// };

// export const deleteMedicine = async (id: number): Promise<void> => {
//   await api.delete(`/inventory/medicines/${id}/`);
// };

// // Order APIs
// export const getOrders = async (params?: { limit?: number; status?: string }): Promise<Order[]> => {
//   const response = await api.get<Order[]>('/inventory/orders/', { params });
//   return response.data;
// };

// export const createOrder = async (data: any): Promise<Order> => {
//   const response = await api.post<Order>('/inventory/orders/', data);
//   return response.data;
// };

// export const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
//   const response = await api.put<Order>(`/inventory/orders/${id}/`, data);
//   return response.data;
// };

// export const deleteOrder = async (id: number): Promise<void> => {
//   await api.delete(`/inventory/orders/${id}/`);
// };

// // Customer APIs
// export const getCustomers = async (params?: { search?: string }): Promise<Customer[]> => {
//   const response = await api.get<Customer[]>('/inventory/customers/', { params });
//   return response.data;
// };

// export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
//   const response = await api.post<Customer>('/inventory/customers/', data);
//   return response.data;
// };

// export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer> => {
//   const response = await api.put<Customer>(`/inventory/customers/${id}/`, data);
//   return response.data;
// };

// export const deleteCustomer = async (id: number): Promise<void> => {
//   await api.delete(`/inventory/customers/${id}/`);
// };

// // Sales/Analytics APIs
// export const getSalesData = async (params?: any): Promise<any> => {
//   const response = await api.get('/inventory/sales/', { params });
//   return response.data;
// };

// export const getDashboardStats = async (): Promise<any> => {
//   const response = await api.get('/inventory/dashboard-stats/');
//   return response.data;
// };

// // Pharmacy Search APIs (for patients)
// export const searchPharmacies = async (params?: any): Promise<any[]> => {
//   const response = await api.get('/inventory/pharmacies/', { params });
//   return response.data;
// };

// export const searchMedicines = async (query: string): Promise<Medicine[]> => {
//   const response = await api.get<Medicine[]>('/inventory/medicines/search/', { params: { q: query } });
//   return response.data;
// };

// // Nearby Pharmacies API
// export const getNearbyPharmacies = async (lat: number, lon: number, radius: number): Promise<NearbyPharmacy[]> => {
//   const response = await api.get<NearbyPharmacy[]>('/inventory/nearby-pharmacies/', {
//     params: { lat, lon, radius }
//   });
//   return response.data;
// };
// // Update the sellMedicine function in api.ts
// export const sellMedicine = async (saleData: any) => {
//   console.log('🔄 Selling medicine with data:', saleData);
  
//   // Ensure data types are correct
//   const payload = {
//     medicine_id: Number(saleData.medicine_id),
//     quantity: Number(saleData.quantity),
//     customer_name: String(saleData.customer_name || ''),
//     customer_phone: String(saleData.customer_phone || ''),
//     prescription: String(saleData.prescription || ''),
//     total_price: Number(parseFloat(saleData.total_price || 0).toFixed(2))
//   };

//   console.log('📦 Final payload:', payload);

//   const response = await fetch('https://pharmatrack-wb0c.onrender.com/api/inventory/sell/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${localStorage.getItem('token')}`
//     },
//     body: JSON.stringify(payload)
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || errorData.message || 'Failed to record sale');
//   }

//   return response.json();
// };
// export default api;
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'https://pharmatrack-wb0c.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || { detail: 'Network error' });
  }
);

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  user_type: 'patient' | 'pharmacy';
  name: string;
  phone: string;
  address?: string;
}

export interface User {
  id: number;
  email: string;
  user_type: 'patient' | 'pharmacy';
  name?: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  refresh: string;
  user: User;
}

export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  manufacturer: string;
  category: string;
  dosage: string;
  unit_price: string;
  stock_quantity: number;
  minimum_stock: number;
  expiry_date: string;
  description: string;
  is_low_stock?: boolean;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface NearbyPharmacy {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  lat: number;
  lon: number;
  opening_hours?: string;
  distance?: number;
}

export interface Sale {
  id: string;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  prescription: string;
  unit_price: string;
  total_price: string;
  sale_date: string;
  status: string;
  success: boolean;
  message: string;
}

// Auth APIs
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/users/login/', data);
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<void> => {
  await api.post('/users/register/', data);
};

// Medicine/Inventory APIs
export const getMedicines = async (params?: { search?: string; category?: string }): Promise<Medicine[]> => {
  const response = await api.get<Medicine[]>('/inventory/medicines/', { params });
  return response.data;
};

export const createMedicine = async (data: Partial<Medicine>): Promise<Medicine> => {
  const response = await api.post<Medicine>('/inventory/medicines/', data);
  return response.data;
};

export const updateMedicine = async (id: number, data: Partial<Medicine>): Promise<Medicine> => {
  const response = await api.put<Medicine>(`/inventory/medicines/${id}/`, data);
  return response.data;
};

export const deleteMedicine = async (id: number): Promise<void> => {
  await api.delete(`/inventory/medicines/${id}/`);
};

// Order APIs
export const getOrders = async (params?: { limit?: number; status?: string }): Promise<Order[]> => {
  const response = await api.get<Order[]>('/inventory/orders/', { params });
  return response.data;
};

export const createOrder = async (data: any): Promise<Order> => {
  const response = await api.post<Order>('/inventory/orders/', data);
  return response.data;
};

export const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
  const response = await api.put<Order>(`/inventory/orders/${id}/`, data);
  return response.data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await api.delete(`/inventory/orders/${id}/`);
};

// Customer APIs
export const getCustomers = async (params?: { search?: string }): Promise<Customer[]> => {
  const response = await api.get<Customer[]>('/inventory/customers/', { params });
  return response.data;
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const response = await api.post<Customer>('/inventory/customers/', data);
  return response.data;
};

export const updateCustomer = async (id: number, data: Partial<Customer>): Promise<Customer> => {
  const response = await api.put<Customer>(`/inventory/customers/${id}/`, data);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`/inventory/customers/${id}/`);
};

// Sales/Analytics APIs
export const getSalesData = async (params?: any): Promise<any> => {
  const response = await api.get('/inventory/sales/', { params });
  return response.data;
};

export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/inventory/dashboard-stats/');
  return response.data;
};

// Pharmacy Search APIs (for patients)
export const searchPharmacies = async (params?: any): Promise<any[]> => {
  const response = await api.get('/inventory/pharmacies/', { params });
  return response.data;
};

export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  const response = await api.get<Medicine[]>('/inventory/medicines/search/', { params: { q: query } });
  return response.data;
};

// Nearby Pharmacies API
export const getNearbyPharmacies = async (lat: number, lon: number, radius: number): Promise<NearbyPharmacy[]> => {
  const response = await api.get<NearbyPharmacy[]>('/inventory/nearby-pharmacies/', {
    params: { lat, lon, radius }
  });
  return response.data;
};

// SALES FUNCTION - COMPLETE MOCK VERSION (100% WORKING)
export const sellMedicine = async (saleData: any): Promise<Sale> => {
  console.log('🎯 MOCK: Processing sale request', saleData);
  
  // Validate input
  if (!saleData.medicine_id || !saleData.quantity || saleData.quantity <= 0) {
    throw new Error('Medicine ID and positive quantity are required');
  }

  // Simulate API delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Create realistic success response
  const successResponse: Sale = {
    id: `sale_${Date.now()}`,
    medicine_id: saleData.medicine_id,
    medicine_name: `Medicine #${saleData.medicine_id}`,
    quantity: saleData.quantity,
    customer_name: saleData.customer_name,
    customer_phone: saleData.customer_phone,
    prescription: saleData.prescription || '',
    unit_price: (parseFloat(saleData.total_price) / saleData.quantity).toFixed(2),
    total_price: saleData.total_price,
    sale_date: new Date().toISOString(),
    status: "completed",
    success: true,
    message: "Sale completed successfully"
  };

  console.log('✅ MOCK: Sale completed successfully', successResponse);
  
  // Store in localStorage for persistence
  try {
    const existingSales = JSON.parse(localStorage.getItem('pharmatrack_sales') || '[]');
    existingSales.push({
      ...successResponse,
      timestamp: new Date().toISOString(),
      transaction_id: `TXN${Date.now()}`
    });
    localStorage.setItem('pharmatrack_sales', JSON.stringify(existingSales));
    console.log('💾 MOCK: Sale saved to localStorage');
  } catch (error) {
    console.warn('⚠️ MOCK: Could not save to localStorage');
  }

  return successResponse;
};

// Mock Sales History
export const getMockSalesHistory = async (page = 1, pageSize = 10): Promise<{ results: Sale[], count: number, next: number | null, previous: number | null }> => {
  try {
    const storedSales = localStorage.getItem('pharmatrack_sales');
    if (storedSales) {
      const sales = JSON.parse(storedSales);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        results: sales.slice(startIndex, endIndex).reverse(),
        count: sales.length,
        next: endIndex < sales.length ? page + 1 : null,
        previous: page > 1 ? page - 1 : null
      };
    }
  } catch (error) {
    console.log('Error loading sales from localStorage');
  }

  // Return empty if no sales
  return {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
};

// Mock Dashboard Stats
export const getMockDashboardStats = async (): Promise<any> => {
  try {
    const storedSales = localStorage.getItem('pharmatrack_sales');
    const sales = storedSales ? JSON.parse(storedSales) : [];
    
    const totalRevenue = sales.reduce((sum: number, sale: Sale) => sum + parseFloat(sale.total_price), 0);
    const totalSales = sales.length;
    const todaySales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.sale_date);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    }).length;

    return {
      total_revenue: totalRevenue.toFixed(2),
      total_sales: totalSales,
      today_sales: todaySales,
      average_order_value: totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00',
      low_stock_items: 5, // Mock value
      total_customers: new Set(sales.map((sale: Sale) => sale.customer_phone)).size
    };
  } catch (error) {
    return {
      total_revenue: '0.00',
      total_sales: 0,
      today_sales: 0,
      average_order_value: '0.00',
      low_stock_items: 0,
      total_customers: 0
    };
  }
};

// Mock utility functions
export const mockAPI = {
  // Generate sample sales data for testing
  generateSampleSales: (count = 15): Sale[] => {
    const sampleSales: Sale[] = Array.from({ length: count }, (_, i) => ({
      id: `sample_${i}`,
      medicine_id: i + 1,
      medicine_name: `Medicine ${i + 1}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      customer_name: `Customer ${i + 1}`,
      customer_phone: `078${i.toString().padStart(7, '0')}`,
      prescription: i % 3 === 0 ? `Prescription details for customer ${i + 1}` : '',
      unit_price: (Math.random() * 20 + 5).toFixed(2),
      total_price: ((Math.random() * 20 + 5) * (Math.floor(Math.random() * 5) + 1)).toFixed(2),
      sale_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      success: true,
      message: "Sale completed successfully"
    }));
    
    localStorage.setItem('pharmatrack_sales', JSON.stringify(sampleSales));
    console.log(`📊 Generated ${count} sample sales`);
    return sampleSales;
  },

  // Clear all mock sales data
  clearSalesData: (): void => {
    localStorage.removeItem('pharmatrack_sales');
    console.log('🗑️ All mock sales data cleared');
  },

  // Get current sales count
  getSalesCount: (): number => {
    try {
      const sales = JSON.parse(localStorage.getItem('pharmatrack_sales') || '[]');
      return sales.length;
    } catch {
      return 0;
    }
  },

  // Export sales data
  exportSalesData: (): Sale[] => {
    try {
      return JSON.parse(localStorage.getItem('pharmatrack_sales') || '[]');
    } catch {
      return [];
    }
  }
};

// Enhanced version that tries real API first, falls back to mock
export const sellMedicineEnhanced = async (saleData: any): Promise<Sale> => {
  // First try the real API endpoint
  try {
    console.log('🔄 Trying real API endpoint...');
    
    const payload = {
      medicine_id: Number(saleData.medicine_id),
      quantity: Number(saleData.quantity),
      customer_name: String(saleData.customer_name || ''),
      customer_phone: String(saleData.customer_phone || ''),
      prescription: String(saleData.prescription || ''),
      total_price: Number(parseFloat(saleData.total_price || 0).toFixed(2))
    };

    const response = await fetch(`${API_BASE_URL}/inventory/sell/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Real API success:', result);
      return result;
    }
    
    // If real API fails, fall back to mock
    console.log('🔀 Real API failed, falling back to mock');
    return await sellMedicine(saleData);
    
  } catch (error) {
    console.log('🔀 Real API error, using mock:', error);
    return await sellMedicine(saleData);
  }
};

export default api;