/**
 * Service to handle all token-related operations
 * Includes storage, retrieval, verification, decoding and renewal
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REFRESH_TIMEOUT = 10000; // 10 segundos
const MAX_REFRESH_RETRIES = 3;

export const decodeToken = (token: string): { exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  const decoded = decodeToken(accessToken);
  if (decoded && decoded.exp) {
    const expiresAt = new Date(decoded.exp * 1000);
    localStorage.setItem('token_expires_at', expiresAt.toISOString());
  } else {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    localStorage.setItem('token_expires_at', expiresAt.toISOString());
  }
};

// Function to get tokens - BYPASSED FOR DEVELOPMENT
export const getTokens = () => {
  return {
    accessToken: 'bypass-token',
    refreshToken: 'bypass-refresh-token',
    isExpired: false
  };
};

// Variable para controlar múltiples intentos de refresh
let refreshPromise: Promise<string> | null = null;
let refreshRetryCount = 0;

export async function refreshAccessToken(): Promise<string> {
  try {
    // Si ya hay un refresh en proceso, retornamos la misma promesa
    if (refreshPromise) {
      return refreshPromise;
    }

    const { refreshToken } = getTokens();
    if (!refreshToken) {
      clearTokens();
      throw new RefreshTokenError('No hay token de refresco disponible');
    }

    // Creamos una nueva promesa de refresh
    refreshPromise = (async () => {
      try {
        // Controlamos el número de intentos
        if (refreshRetryCount >= MAX_REFRESH_RETRIES) {
          clearTokens();
          throw new RefreshTokenError(`Máximo número de intentos de refresco (${MAX_REFRESH_RETRIES}) alcanzado`);
        }

        refreshRetryCount++;

        // Creamos un AbortController para el timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT);

        if (!refreshToken) {
          throw new RefreshTokenError('Token de refresco no disponible');
        }

        // Validamos el formato del refresh token
        if (!refreshToken.includes('.')) {
          throw new RefreshTokenError('Formato de refresh token inválido');
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`,
            'Accept': 'application/json'
          },
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Manejamos diferentes tipos de errores
          switch (response.status) {
            case 401:
              clearTokens();
              throw new TokenExpiredError();
            case 403:
              clearTokens();
              throw new RefreshTokenError('Token de refresco inválido');
            default:
              throw new RefreshTokenError(errorData.message || `Error ${response.status} al refrescar el token`);
          }
        }

        const data = await response.json();
        
        if (!data.access_token || !data.refresh_token) {
          throw new RefreshTokenError('Respuesta inválida del servidor');
        }

        // Guardamos los nuevos tokens
        saveTokens(data.access_token, data.refresh_token);
        
        // Reseteamos el contador de intentos al tener éxito
        refreshRetryCount = 0;
        
        return data.access_token;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new RefreshTokenError('Timeout al refrescar el token');
        }
        if (error instanceof TypeError) {
          throw new NetworkError();
        }
        throw error;
      } finally {
        // Limpiamos la promesa actual
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  } catch (error) {
    console.error('Error en refreshAccessToken:', error);
    clearTokens();
    throw error;
  }
}

let refreshTokenPromise: Promise<string> | null = null;
let pendingRequests: Array<() => void> = [];

export async function fetchWithTokenRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  // Bypass authentication - make requests without token validation
  const { accessToken } = getTokens();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

export async function getValidToken(): Promise<string> {
  // Bypass - always return a fake token
  const { accessToken } = getTokens();
  return accessToken;
}

export function clearTokens(): void {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    
    refreshTokenPromise = null;
    pendingRequests = [];
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const { accessToken, refreshToken, isExpired } = getTokens();

    if (!accessToken) {
      return null;
    }

    if (isExpired) {
      if (!refreshToken) {
        clearTokens();
        return null;
      }
      return await getValidToken();
    }

    return accessToken;
  } catch (error) {
    clearTokens();
    return null;
  }
}

export function getAuthTokenSync(): string | null {
  const { accessToken } = getTokens();
  return accessToken;
}

// Tipos de error personalizados
class RefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefreshTokenError';
  }
}

class TokenExpiredError extends RefreshTokenError {
  constructor() {
    super('El token de refresco ha expirado');
  }
}

class NetworkError extends RefreshTokenError {
  constructor() {
    super('Error de red al refrescar el token');
  }
}