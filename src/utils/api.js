import { Platform } from 'react-native';
import { getAuth } from '../context/AuthContext';
import Config from 'react-native-config';

// Base URL for API requests
const API_BASE_URL = Platform.select({
  ios: Config.API_URL_IOS || 'http://localhost:5001/vu-sports-society/us-central1/api',
  android: Config.API_URL_ANDROID || 'http://10.0.2.2:5001/vu-sports-society/us-central1/api',
  default: 'https://us-central1-vu-sports-society.cloudfunctions.net/api',
});

/**
 * Get default headers for API requests
 * @returns {Promise<Object.<string, string>>} Default headers
 */
const getDefaultHeaders = async () => {
  const headers = {
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
 * @param {string} endpoint - The API endpoint (e.g., 'users', 'events')
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [method='GET'] - The HTTP method
 * @param {*} [data=null] - The request body (for POST, PUT, PATCH requests)
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, query = {}, headers = {}) => {
  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    
    // Add query parameters
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
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
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    // Parse response
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Something went wrong');
    }

    return {
      data: responseData,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      data: null,
      error: error.message || 'Network request failed',
      success: false,
    };
  }
};

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const get = (endpoint, query = {}, headers = {}) => {
  return apiRequest(endpoint, 'GET', null, query, headers);
};

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {*} [data={}] - The request body
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const post = (endpoint, data = {}, query = {}, headers = {}) => {
  return apiRequest(endpoint, 'POST', data, query, {
    'Content-Type': 'application/json',
    ...headers,
  });
};

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {*} [data={}] - The request body
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const put = (endpoint, data = {}, query = {}, headers = {}) => {
  return apiRequest(endpoint, 'PUT', data, query, {
    'Content-Type': 'application/json',
    ...headers,
  });
};

/**
 * Make a PATCH request
 * @param {string} endpoint - The API endpoint
 * @param {*} [data={}] - The request body
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const patch = (endpoint, data = {}, query = {}, headers = {}) => {
  return apiRequest(endpoint, 'PATCH', data, query, {
    'Content-Type': 'application/json',
    ...headers,
  });
};

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @param {Object.<string, any>} [query={}] - Query parameters
 * @param {Object.<string, string>} [headers={}] - Additional headers
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const del = (endpoint, query = {}, headers = {}) => {
  return apiRequest(endpoint, 'DELETE', null, query, headers);
};

/**
 * Upload a file to the server
 * @param {string} endpoint - The API endpoint
 * @param {any} file - The file to upload
 * @param {string} [fieldName='file'] - The field name for the file
 * @param {Object.<string, any>} [additionalData={}] - Additional form data
 * @param {Function} [onProgress] - Progress callback
 * @returns {Promise<{data: *, error: string, success: boolean}>} API response
 */
export const uploadFile = async (endpoint, file, fieldName = 'file', additionalData = {}, onProgress) => {
  try {
    const formData = new FormData();
    
    // Add file to form data
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name || 'file',
      type: file.type || 'application/octet-stream',
    });
    
    // Add additional data to form data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Get default headers
    const headers = await getDefaultHeaders();
    
    // Remove content-type header for FormData
    delete headers['Content-Type'];
    
    // Make the request
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.open('POST', `${API_BASE_URL}/${endpoint}`);
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      
      // Handle progress
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
        if (xhr.status >= 200 && xhr.status < 300) {
          let responseData;
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch (e) {
            responseData = xhr.responseText;
          }
          
          resolve({
            data: responseData,
            error: null,
            success: true,
          });
        } else {
          let error;
          try {
            error = JSON.parse(xhr.responseText).message || 'Upload failed';
          } catch (e) {
            error = 'Upload failed';
          }
          
          reject({
            data: null,
            error,
            success: false,
          });
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        reject({
          data: null,
          error: 'Network request failed',
          success: false,
        });
      };
      
      // Send the request
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return {
      data: null,
      error: error.message || 'Upload failed',
      success: false,
    };
  }
};

/**
 * Fetch a paginated list of items
 * @param {string} endpoint - The API endpoint
 * @param {number} [page=1] - The page number (1-based)
 * @param {number} [limit=10] - The number of items per page
 * @param {Object.<string, any>} [query={}] - Additional query parameters
 * @returns {Promise<{items: Array, total: number, page: number, limit: number, totalPages: number}>} Paginated response
 */
export const fetchPaginated = async (endpoint, page = 1, limit = 10, query = {}) => {
  const response = await get(endpoint, {
    page,
    limit,
    ...query,
  });
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch paginated data');
  }
  
  return response.data;
};

/**
 * Create an API client for a specific resource
 * @param {string} resource - The resource name (e.g., 'users', 'events')
 * @returns {Object} An object with CRUD methods for the resource
 */
export const createResourceClient = (resource) => ({
  /**
   * Get all items
   * @param {Object} [query] - Query parameters
   * @returns {Promise<Array>} Array of items
   */
  getAll: (query = {}) => get(resource, query).then(res => res.data),
  
  /**
   * Get an item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Item data
   */
  getById: (id) => get(`${resource}/${id}`).then(res => res.data),
  
  /**
   * Create a new item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} Created item
   */
  create: (data) => post(resource, data).then(res => res.data),
  
  /**
   * Update an item
   * @param {string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated item
   */
  update: (id, data) => put(`${resource}/${id}`, data).then(res => res.data),
  
  /**
   * Delete an item
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Deletion result
   */
  delete: (id) => del(`${resource}/${id}`).then(res => res.data),
  
  /**
   * Get paginated items
   * @param {number} [page=1] - Page number
   * @param {number} [limit=10] - Items per page
   * @param {Object} [query] - Additional query parameters
   * @returns {Promise<Object>} Paginated response
   */
  getPaginated: (page = 1, limit = 10, query = {}) => 
    fetchPaginated(resource, page, limit, query),
});

// Example usage:
// const userApi = createResourceClient('users');
// const { data: users } = await userApi.getAll();
// const { data: user } = await userApi.getById('123');
// const { data: newUser } = await userApi.create({ name: 'John' });
// const { data: updatedUser } = await userApi.update('123', { name: 'John Doe' });
// await userApi.delete('123');
// const { items, total, page, totalPages } = await userApi.getPaginated(1, 10);
