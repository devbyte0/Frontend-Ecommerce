// AdminContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AdminContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URI;

const initialState = {
  admin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// --- Helpers ---
const safeParse = (value) => {
  try {
    if (!value) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const fetchCurrentAdmin = async (accessToken) => {
  const res = await axios.get(`${API_BASE_URL}/api/admin/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data?.admin || null;
};

// --- Reducer ---
function adminReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken ?? state.refreshToken,
        error: null,
      };
    case 'SET_ADMIN_DATA':
      return {
        ...state,
        admin: action.payload,
      };
    default:
      return state;
  }
}

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const navigate = useNavigate();

  const clearAuthStorage = () => {
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminData');
  };

 useEffect(() => {
  const initAuth = async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    const accessToken = localStorage.getItem('adminAccessToken');

    if (!refreshToken) return; // must have refresh token

    try {
      let token = accessToken;

      // If no access token or it’s invalid, refresh it
      if (!token) {
        const refreshRes = await axios.post(`${API_BASE_URL}/api/admin/refresh-token`, { token: refreshToken });
        token = refreshRes.data.accessToken;
        localStorage.setItem('adminAccessToken', token);
      }

      // Fetch admin data
      let admin = safeParse(localStorage.getItem('adminData'));
      if (!admin) {
        admin = await fetchCurrentAdmin(token);
        if (admin) localStorage.setItem('adminData', JSON.stringify(admin));
      }

      if (!admin) return clearAuthStorage();

      dispatch({ type: 'LOGIN_SUCCESS', payload: { admin, accessToken: token, refreshToken } });
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthStorage();
    }
  };

  initAuth();
}, []);


  // --- Axios interceptors ---
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
        config.baseURL = API_BASE_URL;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          state.refreshToken &&
          !originalRequest.url.includes('/refresh-token')
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/refresh-token`, {
              token: state.refreshToken,
            });
            const { accessToken } = res.data;
            localStorage.setItem('adminAccessToken', accessToken);

            dispatch({
              type: 'REFRESH_TOKEN',
              payload: { accessToken },
            });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            await handleLogout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.accessToken, state.refreshToken]);

  // --- Auth Actions ---
  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, credentials);
      const { accessToken, refreshToken, admin } = res.data || {};
      if (!accessToken || !refreshToken) throw new Error('Invalid login response');

      localStorage.setItem('adminAccessToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);

      let currentAdmin = admin || (await fetchCurrentAdmin(accessToken));
      if (!currentAdmin) throw new Error('Unable to load admin profile');
      localStorage.setItem('adminData', JSON.stringify(currentAdmin));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { admin: currentAdmin, accessToken, refreshToken },
      });

      return { admin: currentAdmin, accessToken, refreshToken };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/logout`,
        {},
        { headers: { Authorization: `Bearer ${state.accessToken}` } }
      );
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      clearAuthStorage();
      dispatch({ type: 'LOGOUT' });
      navigate('/admin');
    }
  };

  const registerAdmin = async (adminData, imageFile) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const formData = new FormData();
      Object.entries(adminData).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      const res = await axios.post(`${API_BASE_URL}/api/admin/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const updateAdminData = (data) => {
    localStorage.setItem('adminData', JSON.stringify(data));
    dispatch({ type: 'SET_ADMIN_DATA', payload: data });
  };

  const refreshAccessToken = async () => {
    if (!state.refreshToken) return null;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/refresh-token`, { token: state.refreshToken });
      localStorage.setItem('adminAccessToken', res.data.accessToken);
      dispatch({ type: 'REFRESH_TOKEN', payload: { accessToken: res.data.accessToken } });
      return res.data.accessToken;
    } catch (error) {
      await handleLogout();
      throw error;
    }
  };

  // --- CRUD Operations ---
  const createAdmin = async (adminData, imageFile) => {
    const formData = new FormData();
    Object.entries(adminData).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const getAdmin = async (adminId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const updateAdmin = async (adminId, adminData, imageFile) => {
    const formData = new FormData();
    Object.entries(adminData).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/${adminId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const listAdmins = async (params = {}) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin`, {
        params,
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch admins';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // --- Exposed Context Value ---
  const value = {
    ...state,
    login,
    logout: handleLogout,
    registerAdmin,
    updateAdminData,
    refreshToken: refreshAccessToken,
    createAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    listAdmins,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
