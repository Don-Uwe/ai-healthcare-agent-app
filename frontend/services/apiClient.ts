// frontend/src/services/apiClient.ts
const PROD_URL = "http://10.0.2.2:3000/api";
const extra = Constants.expoConfig?.extra ?? {};
const PROD_URL: string = extra.PROD_URL;

// 🔥 Main fix: Sirf successful responses return
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${PROD_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    
    if (response.ok) {  // status 200-299
      const data = await response.json();
      return { 
        success: true, 
        data: data, 
        status: response.status 
      };
    } 
    
    
    else {
      const errorData = await response.json().catch(() => ({}));
      throw { 
        success: false, 
        status: response.status, 
        error: errorData 
      };
    }
    
  } catch (error) {
    // Network errors bhi cache mat karo
    throw error;
  }
}

// GET request helper
export async function get(endpoint: string) {
  return apiRequest(endpoint, { method: 'GET' });
}

// POST request helper
export async function post(endpoint: string, data: any) {
  return apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });
}

// PUT request helper
export async function put(endpoint: string, data: any) {
  return apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });
}

// DELETE request helper
export async function del(endpoint: string) {
  return apiRequest(endpoint, { method: 'DELETE' });
}