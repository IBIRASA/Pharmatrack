import axios from 'axios';

// Prefer an explicit environment variable, fall back to localhost in dev, otherwise production.
const API_BASE_URL =
  // Vite env var (set VITE_API_BASE_URL during local dev if needed)
  (import.meta as any).env?.VITE_API_BASE_URL ||
  // If running on localhost, point to local Django dev server
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000/api'
    : 'https://pharmatrack-wb0c.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

api.interceptors.request.use(
  (config) => {
    // ensure headers exist and add Authorization when token is present
    const token = localStorage.getItem('token');
    if (!config.headers) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - axios config headers can be created here
      config.headers = {};
    }
    if (token) {
      // set Authorization header
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
    const status = error.response?.status;
    const respData = error.response?.data;
    const requestUrl = error.config?.url || '';

    // For most requests: on 401 clear auth and redirect to login.
    // But do not force-redirect when the client is calling the auth endpoints
    // themselves (login/register) so the UI can display a meaningful message.
    if (status === 401 && !(requestUrl?.includes('/users/login') || requestUrl?.includes('/users/register'))) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // ignore
      }
      window.location.href = '/login';
    }

    // Normalize the rejection payload so callers can inspect status and data
    return Promise.reject({ status, data: respData, message: error.message || 'Network error' });
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
  latitude?: number;
  longitude?: number;
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

export interface Order {
  id: number;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  created_at: string;
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
  is_expiring_soon?: boolean;
  is_expired?: boolean;
  days_until_expiry?: number;
  expiration_level?: 'normal' | 'warning' | 'critical' | 'expired';
  expiration_message?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  total_purchases: number;
  last_purchase: string;
  total_spent: number;
  purchase_count: number;
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
  transaction_id?: string;
}

export interface DashboardStats {
  weekly_sales?: any[];
  total_revenue: string;
  total_sales: number;
  total_orders?: number;
  today_sales: number;
  average_order_value: string;
  low_stock_items: number;
  total_customers: number;
  monthly_revenue: string;
  monthly_sales: number;
}

export interface SalesReport {
  date: string;
  revenue: number;
  sales_count: number;
  average_ticket: number;
}

// Auth APIs
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/users/login/', data);
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<any> => {
  const resp = await api.post('/users/register/', data);
  return resp.data;
};

// Get current authenticated user (server-verified)
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me/');
  return response.data;
};

// Update current user profile (PATCH /users/me/)
export const updateCurrentUser = async (data: Partial<User> & Record<string, any>): Promise<User> => {
  const response = await api.patch<User>('/users/me/', data);
  return response.data;
};

// Medicine/Inventory APIs
export const getMedicines = async (params?: { search?: string; category?: string; latitude?: number; longitude?: number }): Promise<Medicine[]> => {
  const response = await api.get<Medicine[]>('/inventory/medicines/', { params });
  return response.data;
};

export const getExpiringMedicines = async (): Promise<Medicine[]> => {
  const response = await api.get<Medicine[]>('/inventory/medicines/expiring-soon/');
  return response.data;
};

export const createMedicine = async (data: Partial<Medicine>): Promise<Medicine> => {
  const response = await api.post<Medicine>('/inventory/medicines/', data);
  return response.data;
};

export async function updateMedicine(id: number, data: Record<string, any>) {
  // use axios instance so baseURL and Authorization interceptor are applied
  const response = await api.patch<Medicine>(`/inventory/medicines/${id}/`, data);
  return response.data;
}

export async function deleteMedicine(id: number) {
  const resp = await api.delete(`/inventory/medicines/${id}/`);
  return resp.status === 204 ? true : resp.data ?? true;
}

// Order APIs
export const getOrders = async (params?: { limit?: number; status?: string }): Promise<Order[]> => {
  const response = await api.get<Order[]>('/inventory/orders/', { params });
  return response.data;
};

export const createOrder = async (data: any): Promise<Order> => {
  // Legacy: for patient orders use the place endpoint
  const response = await api.post<Order>('/inventory/orders/place/', data);
  return response.data;
};

export const approveOrder = async (orderId: number): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/approve/`);
  return response.data;
};

export const rejectOrder = async (orderId: number): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/reject/`);
  return response.data;
};

export const markOrderShipped = async (orderId: number): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/ship/`);
  return response.data;
};

export const completeOrder = async (orderId: number): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/complete/`);
  return response.data;
};

export const confirmOrderDelivery = async (orderId: number, payload?: { customer_name?: string }): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/confirm/`, payload || {});
  return response.data;
};

export const acceptOrderApproval = async (orderId: number): Promise<any> => {
  const response = await api.post(`/inventory/orders/${orderId}/accept/`);
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/inventory/orders/my/');
  return response.data;
};

export const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
  const response = await api.put<Order>(`/inventory/orders/${id}/`, data);
  return response.data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await api.delete(`/inventory/orders/${id}/`);
};

export const getCustomers = async (params?: { search?: string }): Promise<Customer[]> => {
  try {
    const resp = await api.get<Customer[]>('/inventory/customers/', { params });
    return resp.data;
  } catch (err) {
    console.error('Error fetching customers from backend:', err);
    // Only fallback to mock when client is explicitly offline. This prevents showing
    // stale/mock data while the backend is reachable but returning errors.
    if (typeof window !== 'undefined' && 'navigator' in window && !window.navigator.onLine) {
      try {
        const sales = await getMockSalesHistory(1, 1000);
      const customersMap = new Map<string, Customer>();

      sales.results.forEach((sale: Sale) => {
        const phone = sale.customer_phone || 'Unknown';
        if (!customersMap.has(phone)) {
          customersMap.set(phone, {
            id: `customer_${phone}`,
            name: sale.customer_name,
            phone: phone,
            total_purchases: 0,
            last_purchase: sale.sale_date,
            total_spent: 0,
            purchase_count: 0
          });
        }

        const customer = customersMap.get(phone)!;
        customer.total_purchases += sale.quantity;
        customer.total_spent += parseFloat(sale.total_price);
        customer.purchase_count += 1;
        if (new Date(sale.sale_date) > new Date(customer.last_purchase)) {
          customer.last_purchase = sale.sale_date;
        }
      });

      let customers = Array.from(customersMap.values());
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        customers = customers.filter(customer =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm)
        );
      }
      customers.sort((a, b) => b.total_spent - a.total_spent);
      return customers;
      } catch (e2) {
        console.error('Error getting customers fallback:', e2);
        return [];
      }
    }

    // Not offline -> rethrow so callers can display a helpful error
    throw err;
  }
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  // Local mock: create a customer id and store minimal info in localStorage sales (if desired)
  return {
    id: `customer_${Date.now()}`,
    name: data.name || 'New Customer',
    phone: data.phone || '',
    total_purchases: 0,
    last_purchase: new Date().toISOString(),
    total_spent: 0,
    purchase_count: 0
  };
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  // Update mock sales records stored in localStorage (best-effort)
  try {
    const sales = await getMockSalesHistory(1, 1000);
    sales.results.forEach((sale: Sale) => {
      if (sale.customer_phone === data.phone) {
        sale.customer_name = data.name || sale.customer_name;
      }
    });
    localStorage.setItem('pharmatrack_sales', JSON.stringify(sales.results));
  } catch (e) {
    // ignore
  }
  return {
    id,
    name: data.name || 'Updated Customer',
    phone: data.phone || '',
    total_purchases: data.total_purchases || 0,
    last_purchase: data.last_purchase || new Date().toISOString(),
    total_spent: data.total_spent || 0,
    purchase_count: data.purchase_count || 0
  };
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const sales = await getMockSalesHistory(1, 1000);
    const phone = id.replace('customer_', '');
    const updatedSales = sales.results.filter((sale: Sale) => sale.customer_phone !== phone);
    localStorage.setItem('pharmatrack_sales', JSON.stringify(updatedSales));
    console.log(`Deleted customer: ${phone}`);
  } catch (e) {
    console.warn('Failed to delete customer from mock storage', e);
  }
};

// Sales/Analytics APIs
export const getSalesData = async (params?: any): Promise<any> => {
  const response = await api.get('/inventory/sales/', { params });
  return response.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const resp = await api.get('/inventory/dashboard-stats/');
    const d = resp.data;
    return {
      weekly_sales: d.weekly_sales || [],
      total_orders: d.total_orders ?? d.total_sales ?? 0,
      total_revenue: (d.total_revenue ?? 0).toFixed ? (Number(d.total_revenue).toFixed(2)) : String(d.total_revenue || '0.00'),
      total_sales: d.total_sales ?? 0,
      today_sales: d.today_sales ?? 0,
      average_order_value: (d.average_order_value ?? 0).toFixed ? (Number(d.average_order_value).toFixed(2)) : String(d.average_order_value || '0.00'),
      low_stock_items: d.low_stock_items ?? 0,
      total_customers: d.total_customers ?? 0,
      monthly_revenue: (d.monthly_revenue ?? 0).toFixed ? (Number(d.monthly_revenue).toFixed(2)) : String(d.monthly_revenue || '0.00'),
      monthly_sales: d.monthly_sales ?? d.total_sales ?? 0
    };
  } catch (error) {
    console.error('Error getting dashboard stats from backend:', error);
    // Only use mock fallback when the client is offline
    if (typeof window !== 'undefined' && 'navigator' in window && !window.navigator.onLine) {
      try {
        const sales = await getMockSalesHistory(1, 1000);
      const today = new Date().toDateString();
      const totalRevenue = sales.results.reduce((sum: number, sale: Sale) => sum + parseFloat(sale.total_price), 0);
      const totalSales = sales.results.length;
      const todaySales = sales.results.filter((sale: Sale) => new Date(sale.sale_date).toDateString() === today).length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlySales = sales.results.filter((sale: Sale) => new Date(sale.sale_date) >= thirtyDaysAgo);
      const monthlyRevenue = monthlySales.reduce((sum: number, sale: Sale) => sum + parseFloat(sale.total_price), 0);
      const uniqueCustomers = new Set(sales.results.map((sale: Sale) => sale.customer_phone)).size;
      return {
        weekly_sales: [],
        total_orders: totalSales,
        total_revenue: totalRevenue.toFixed(2),
        total_sales: totalSales,
        today_sales: todaySales,
        average_order_value: totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00',
        low_stock_items: 5,
        total_customers: uniqueCustomers,
        monthly_revenue: monthlyRevenue.toFixed(2),
        monthly_sales: monthlySales.length
      };
      } catch (e) {
        console.error('Fallback failed:', e);
        return {
          weekly_sales: [],
          total_orders: 0,
          total_revenue: '0.00',
          total_sales: 0,
          today_sales: 0,
          average_order_value: '0.00',
          low_stock_items: 0,
          total_customers: 0,
          monthly_revenue: '0.00',
          monthly_sales: 0
        };
      }
    }

    // Not offline -> rethrow so callers can show a proper backend error
    throw error;
  }
};

// SALES REPORTS - NEW FUNCTION
export const getSalesReports = async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<SalesReport[]> => {
  try {
    // Prefer backend sales endpoint (scoped to authenticated pharmacy).
    try {
      const resp = await api.get<any[]>('/inventory/sales/');
      const sales = resp.data || [];
      const reports: SalesReport[] = [];

      // Group sales by requested period
      const salesByDate = new Map<string, { revenue: number; count: number }>();

      sales.forEach((sale: any) => {
        let dateKey: string;
        const saleDate = new Date(sale.sale_date || sale.sale_date);
        switch (period) {
          case 'daily':
            dateKey = saleDate.toDateString();
            break;
          case 'weekly': {
            const monday = new Date(saleDate);
            monday.setDate(saleDate.getDate() - saleDate.getDay() + 1);
            dateKey = `Week of ${monday.toDateString()}`;
            break;
          }
          case 'monthly':
            dateKey = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          default:
            dateKey = saleDate.toDateString();
        }

        if (!salesByDate.has(dateKey)) salesByDate.set(dateKey, { revenue: 0, count: 0 });
        const d = salesByDate.get(dateKey)!;
        d.revenue += Number(sale.total_price || sale.total_price || 0);
        d.count += 1;
      });

      salesByDate.forEach((data, date) => {
        reports.push({
          date,
          revenue: data.revenue,
          sales_count: data.count,
          average_ticket: data.count > 0 ? data.revenue / data.count : 0,
        });
      });

      // Sort newest first
      reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return reports;
    } catch (e) {
      console.warn('Backend sales endpoint failed:', e);
      // Only fall back to mock when offline
      if (typeof window !== 'undefined' && 'navigator' in window && !window.navigator.onLine) {
        try {
          const sales = await getMockSalesHistory(1, 1000);
        const reports: SalesReport[] = [];
        const salesByDate = new Map<string, { revenue: number; count: number }>();
        sales.results.forEach((sale: Sale) => {
          let dateKey: string;
          const saleDate = new Date(sale.sale_date);
          switch (period) {
            case 'daily':
              dateKey = saleDate.toDateString();
              break;
            case 'weekly': {
              const monday = new Date(saleDate);
              monday.setDate(saleDate.getDate() - saleDate.getDay() + 1);
              dateKey = `Week of ${monday.toDateString()}`;
              break;
            }
            case 'monthly':
              dateKey = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
              break;
            default:
              dateKey = saleDate.toDateString();
          }

          if (!salesByDate.has(dateKey)) salesByDate.set(dateKey, { revenue: 0, count: 0 });
          const d = salesByDate.get(dateKey)!;
          d.revenue += parseFloat(sale.total_price);
          d.count += 1;
        });

        salesByDate.forEach((data, date) => {
          reports.push({ date, revenue: data.revenue, sales_count: data.count, average_ticket: data.count > 0 ? data.revenue / data.count : 0 });
        });
        reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return reports;
        } catch (err2) {
          console.error('Error generating sales reports (mock fallback failed):', err2);
          return [];
        }
      }

      // Not offline -> rethrow so caller can display backend error
      throw e;
    }
  } catch (error) {
    console.error('Unexpected error in getSalesReports:', error);
    return [];
  }
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
  const response = await api.get<any[]>('/inventory/nearby-pharmacies/', {
    params: { latitude: lat, longitude: lon, radius }
  });

  // Map backend response keys (latitude/longitude) to client expected keys (lat/lon)
  return (response.data || []).map((p: any) => ({
    id: p.id || p.user_id || Math.random(),
    name: p.name,
    address: p.address,
    phone: p.phone,
    lat: p.latitude ?? p.lat,
    lon: p.longitude ?? p.lon,
    opening_hours: p.opening_hours,
    distance: p.distance
  }));
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
    message: "Sale completed successfully",
    transaction_id: `TXN${Date.now()}`
  };

  console.log(' MOCK: Sale completed successfully', successResponse);
  
  // Store in localStorage for persistence
  try {
    const existingSales = JSON.parse(localStorage.getItem('pharmatrack_sales') || '[]');
    existingSales.push(successResponse);
    localStorage.setItem('pharmatrack_sales', JSON.stringify(existingSales));
    console.log(' MOCK: Sale saved to localStorage');
  } catch (error) {
    console.warn(' MOCK: Could not save to localStorage');
  }

  return successResponse;
};

// Mock Sales History
export const getMockSalesHistory = async (page = 1, pageSize = 10): Promise<{ results: Sale[], count: number, next: number | null, previous: number | null }> => {
  try {
    const storedSales = localStorage.getItem('pharmatrack_sales');
    const sales = storedSales ? JSON.parse(storedSales) : [];
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      results: sales.slice(startIndex, endIndex).reverse(), // Newest first
      count: sales.length,
      next: endIndex < sales.length ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    };
  } catch (error) {
    console.log('Error loading sales from localStorage');
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};

// Mock utility functions
export const mockAPI = {
  // Generate sample sales data for testing
  generateSampleSales: (count = 15): Sale[] => {
    const sampleSales: Sale[] = Array.from({ length: count }, (_, i) => {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const unitPrice = (Math.random() * 20 + 5).toFixed(2);
      const totalPrice = (parseFloat(unitPrice) * quantity).toFixed(2);
      
      return {
        id: `sample_${i}`,
        medicine_id: i + 1,
        medicine_name: `Medicine ${i + 1}`,
        quantity: quantity,
        customer_name: `Customer ${i + 1}`,
        customer_phone: `078${i.toString().padStart(7, '0')}`,
        prescription: i % 3 === 0 ? `Prescription details for customer ${i + 1}` : '',
        unit_price: unitPrice,
        total_price: totalPrice,
        sale_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        success: true,
        message: "Sale completed successfully",
        transaction_id: `TXN${1000 + i}`
      };
    });
    
    localStorage.setItem('pharmatrack_sales', JSON.stringify(sampleSales));
    console.log(` Generated ${count} sample sales`);
    return sampleSales;
  },

  // Clear all mock sales data
  clearSalesData: (): void => {
    localStorage.removeItem('pharmatrack_sales');
    console.log(' All mock sales data cleared');
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
  try {
    console.log(' Trying real API endpoint...');
    
    const payload = {
      medicine_id: Number(saleData.medicine_id),
      quantity: Number(saleData.quantity),
      customer_name: String(saleData.customer_name || ''),
      customer_phone: String(saleData.customer_phone || ''),
      prescription: String(saleData.prescription || ''),
      total_price: Number(parseFloat(saleData.total_price || 0).toFixed(2))
    };

    // Use axios instance so Authorization header and baseURL are handled consistently.
    const resp = await api.post<Sale>('/inventory/sell/', payload);
    if (resp && resp.status >= 200 && resp.status < 300) {
      console.log(' Real API success:', resp.data);
      return resp.data;
    }
    // Unexpected non-2xx status
    throw new Error(`Server returned status ${resp.status}`);
  } catch (error: any) {
    // Only fall back to mock when offline; otherwise rethrow the error so the UI shows the server error.
    const offline = typeof window !== 'undefined' && 'navigator' in window && !window.navigator.onLine;
    if (offline) {
      console.log(' Real API error and client offline, using mock:', error);
      return await sellMedicine(saleData);
    }
    // If axios provided a response payload, try to surface a friendly message
    const errMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || String(error);
    console.error('sellMedicineEnhanced error:', errMsg);
    throw new Error(errMsg);
  }
};

export default api;