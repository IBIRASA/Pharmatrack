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
// Update the sellMedicine function in api.ts
export const sellMedicine = async (saleData: any) => {
  const response = await fetch('https://pharmatrack-wb0c.onrender.com/api/inventory/sell/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      medicine_id: saleData.medicine_id,
      quantity: saleData.quantity,
      customer: {
        name: saleData.customer_name,
        phone: saleData.customer_phone
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to record sale');
  }
  
  return response.json();
};
export default api;
