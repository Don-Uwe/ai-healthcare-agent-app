import axios from 'axios';
import {SECURE_KEYS, secureRetrieveItem} from './SecureStorageUtils';

// Centralized Axios instance with authentication handling
const authAxios = axios.create({
  baseURL: 'https://uhsocial.in/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamically attach Bearer token before every request
authAxios.interceptors.request.use(
  async (config) => {
    const token = await secureRetrieveItem(SECURE_KEYS.USER_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove Authorization header to prevent invalid "Bearer undefined/null"
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default authAxios;
