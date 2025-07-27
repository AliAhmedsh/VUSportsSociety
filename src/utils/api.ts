import { Platform } from 'react-native';
import { ApiResponse, PaginatedResponse } from '../types';
import { getAuth } from '../context/AuthContext';
import Config from 'react-native-config';

// Base URL for API requests
const API_BASE_URL = Platform.select({
  ios: Config.API_URL_IOS || 'http://localhost:5001/vu-sports-society/us-central1/api',
  android: Config.API_URL_ANDROID || 'http://10.0.2.2:5001/vu-sports-society/us-central1/api',
  default: 'https://us-central1-vu-sports-society.cloudfunctions.net/api',
});

// Default headers for API requests
const getDefaultHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Add auth token if available
  const { user } = getAuth();
  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  
  return headers;
};

/**
 * Make an API request
 * @param endpoint - The API endpoint (e.g., 'users', 'events')
 * @param method - The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param data - The request body (for POST, PUT, PATCH requests)
 * @param query - Query parameters as an object
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data: any = null,
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    
    // Add query parameters
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(`${key}[]`, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
    
    // Get default headers
    const defaultHeaders = await getDefaultHeaders();
    
    // Make the request
    const response = await fetch(url.toString(), {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Parse the response
    const responseData = await response.json().catch(() => ({}));
    
    // Handle non-2xx responses
    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        data: responseData,
      };
    }
    
    return {
      success: true,
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Make a GET request
 * @param endpoint - The API endpoint
 * @param query - Query parameters
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const get = <T = any>(
  endpoint: string,
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, 'GET', null, query, headers);
};

/**
 * Make a POST request
 * @param endpoint - The API endpoint
 * @param data - The request body
 * @param query - Query parameters
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const post = <T = any>(
  endpoint: string,
  data: any = {},
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, 'POST', data, query, headers);
};

/**
 * Make a PUT request
 * @param endpoint - The API endpoint
 * @param data - The request body
 * @param query - Query parameters
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const put = <T = any>(
  endpoint: string,
  data: any = {},
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, 'PUT', data, query, headers);
};

/**
 * Make a PATCH request
 * @param endpoint - The API endpoint
 * @param data - The request body
 * @param query - Query parameters
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const patch = <T = any>(
  endpoint: string,
  data: any = {},
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, 'PATCH', data, query, headers);
};

/**
 * Make a DELETE request
 * @param endpoint - The API endpoint
 * @param query - Query parameters
 * @param headers - Additional headers
 * @returns A promise that resolves to the API response
 */
export const del = <T = any>(
  endpoint: string,
  query: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, 'DELETE', null, query, headers);
};

/**
 * Upload a file to the server
 * @param endpoint - The API endpoint
 * @param file - The file to upload (either a File object or a React Native file object)
 * @param fieldName - The field name for the file (default: 'file')
 * @param additionalData - Additional form data to include in the request
 * @param onProgress - Progress callback
 * @returns A promise that resolves to the API response
 */
export const uploadFile = async <T = any>(
  endpoint: string,
  file: any,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Add file to form data
    const fileData = {
      uri: file.uri || file.path,
      type: file.type || 'application/octet-stream',
      name: file.name || 'file',
    };
    
    formData.append(fieldName, fileData as any);
    
    // Add additional data to form data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Get default headers (without Content-Type for FormData)
    const defaultHeaders = await getDefaultHeaders();
    const { 'Content-Type': _, ...headersWithoutContentType } = defaultHeaders;
    
    // Make the request
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve) => {
      xhr.open('POST', `${API_BASE_URL}/${endpoint}`);
      
      // Set headers
      Object.entries(headersWithoutContentType).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }
      
      // Handle response
      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText || '{}');
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: response,
              status: xhr.status,
            });
          } else {
            resolve({
              success: false,
              error: response.message || `HTTP error! status: ${xhr.status}`,
              status: xhr.status,
              data: response,
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to parse response',
            status: xhr.status,
          });
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        resolve({
          success: false,
          error: 'Network error',
          status: 0,
        });
      };
      
      // Send the request
      xhr.send(formData as any);
    });
  } catch (error) {
    console.error('File upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Fetch a paginated list of items
 * @param endpoint - The API endpoint
 * @param page - The page number (1-based)
 * @param limit - The number of items per page
 * @param query - Additional query parameters
 * @returns A promise that resolves to a paginated response
 */
export const fetchPaginated = async <T>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  query: Record<string, any> = {}
): Promise<PaginatedResponse<T>> => {
  const response = await get<T[]>(endpoint, {
    page,
    limit,
    ...query,
  });
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch data');
  }
  
  // Extract pagination info from headers or response
  const total = response.data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  
  return {
    items: response.data?.items || [],
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Create an API client for a specific resource
 * @param resource - The resource name (e.g., 'users', 'events')
 * @returns An object with CRUD methods for the resource
 */
export const createResourceClient = <T extends { id: string }>(
  resource: string
) => {
  return {
    /**
     * Get all items
     */
    getAll: (query: Record<string, any> = {}) => get<T[]>(resource, query),
    
    /**
     * Get a single item by ID
     */
    getById: (id: string, query: Record<string, any> = {}) =>
      get<T>(`${resource}/${id}`, query),
    
    /**
     * Create a new item
     */
    create: (data: Omit<T, 'id'>) => post<T>(resource, data),
    
    /**
     * Update an existing item
     */
    update: (id: string, data: Partial<T>) =>
      put<T>(`${resource}/${id}`, data),
    
    /**
     * Partially update an existing item
     */
    patch: (id: string, data: Partial<T>) =>
      patch<T>(`${resource}/${id}`, data),
    
    /**
     * Delete an item by ID
     */
    delete: (id: string) => del<void>(`${resource}/${id}`),
    
    /**
     * Get a paginated list of items
     */
    paginate: (page: number = 1, limit: number = 10, query: Record<string, any> = {}) =>
      fetchPaginated<T>(resource, page, limit, query),
  };
};

// Example usage:
// const userApi = createResourceClient<User>('users');
// const { data: users } = await userApi.getAll();
// const { data: user } = await userApi.getById('123');
// await userApi.create({ name: 'John Doe', email: 'john@example.com' });
// await userApi.update('123', { name: 'John Updated' });
// await userApi.delete('123');
// const { items, total } = await userApi.paginate(1, 10, { role: 'admin' });
