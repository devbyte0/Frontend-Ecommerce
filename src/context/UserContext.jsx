import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the context
export const UserContext = createContext();

// UserProvider component
export const UserProvider = ({ children }) => {
    const navigate = useNavigate();

    

    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedAddress, setSavedAddress] = useState(null);
    const [savedPaymentMethod, setSavedPaymentMethod] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const accessToken = localStorage.getItem('accessToken');
        if (storedUser && accessToken) {
            setUser(storedUser);
            setIsLoggedIn(true);
            setSavedAddress(storedUser.savedAddress);
            setSavedPaymentMethod(storedUser.savedPaymentMethod);
        }
    }, []);

    useEffect(() => {
        if (redirectPath) {
            navigate(redirectPath);
            setRedirectPath(null);
        }
    }, [redirectPath, navigate]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/login`, { email, password });
            const { user, accessToken, refreshToken } = response.data;

            setUser(user);
            setIsLoggedIn(true);
            setSavedAddress(user.savedAddress || null);
            setSavedPaymentMethod(user.savedPaymentMethod || null);
            

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setRedirectPath('/');
            
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (registerData) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URI}/api/register`, registerData);
            setRedirectPath('/login');
        } catch (error) {
            console.error("Registration error:", error);
            setErrorMessage(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        setSavedAddress(null);
        setSavedPaymentMethod(null);
        
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setRedirectPath('/login');
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error("No refresh token available");

            const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/auth/refresh`, { token: refreshToken });
            const newAccessToken = response.data.accessToken;

            localStorage.setItem("accessToken", newAccessToken);
            return newAccessToken;
        } catch (error) {
            console.error("Error refreshing token:", error);
            logout();
        }
    };

    const authRequest = async (url, options = {}) => {
        let accessToken = localStorage.getItem("accessToken");

        try {
            const response = await axios({
                ...options,
                url,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                accessToken = await refreshAccessToken();
                if (accessToken) {
                    return axios({
                        ...options,
                        url,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }).then(res => res.data);
                }
            }
            throw error;
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoggedIn,
                savedAddress,
                savedPaymentMethod,
                errorMessage,
                login,
                logout,
                register,
                updateProfile: (newData) => {
                    const updatedUser = { ...user, ...newData };
                    setUser(updatedUser);
                    setSavedAddress(updatedUser.savedAddress);
                    setSavedPaymentMethod(updatedUser.savedPaymentMethod);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                },
                clearSavedInfo: () => {
                    setSavedAddress(null);
                    setSavedPaymentMethod(null);
                    const updatedUser = { ...user, savedAddress: null, savedPaymentMethod: null };
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                },
                authRequest,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

