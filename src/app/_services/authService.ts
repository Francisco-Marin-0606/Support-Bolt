import axios, { AxiosError } from 'axios';
import { User } from '../types/user';
import {
  saveTokens,
  getTokens,
  getValidToken,
  fetchWithTokenRefresh,
  clearTokens
} from './tokenService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Exportamos las funciones del tokenService para mantener compatibilidad
export { fetchWithTokenRefresh, getValidToken } from './tokenService';

// Login user
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    saveTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  } catch (error) {
    console.error('Error in login:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || 'Error al iniciar sesión');
    }

    throw error;
  }
}

// Logout user
export function logout(): void {
  try {
    clearTokens();
  } catch (error) {
    console.error('Error in logout:', error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/auth/me`);
    if (!response.ok) {
      throw new Error('Error al obtener el usuario actual');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    throw error;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const { accessToken, refreshToken, isExpired } = getTokens();
  
  // Si no hay tokens, no está autenticado
  if (!accessToken || !refreshToken) {
    return false;
  }
  
  // Si el token está expirado, intentamos refrescarlo automáticamente
  if (isExpired) {
    // Iniciamos el proceso de refresh en segundo plano
    getValidToken().catch(() => {
      // Si falla el refresh, hacemos logout
      logout();
    });
  }
  
  return true;
}

// Re-exportamos las funciones de token para mantener compatibilidad
export { getAuthToken, getAuthTokenSync } from './tokenService';