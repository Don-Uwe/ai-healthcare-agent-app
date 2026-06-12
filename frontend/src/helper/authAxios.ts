import axios from 'axios';
import {SECURE_KEYS, secureRetrieveItem} from './SecureStorageUtils';
import {PROD_URL} from './APIUtils';

// Centralized Axios instance with authentication handling.
// baseURL is sourced from APIUtils so it honors env overrides defined in
// app.config.js (see .env.example for available variables).
const authAxios = axios.create({
  baseURL: PROD_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamically attach Bearer token before every request.
// `config.headers ??= {}` guards against the rare case where an Axios adapter
// or custom config omits the headers object entirely, preventing a runtime
// TypeError when setting `config.headers.Authorization`.
authAxios.interceptors.request.use(
  async (config) => {
    config.headers ??= {} as typeof config.headers;
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
