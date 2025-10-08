// src/app/login/page.js
'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { buttonStyles, inputStyles, textStyles } from '@/app/styles/themes';
import { login } from '@/app/_services/authService';
import { getAuthToken } from '@/app/_services/tokenService';

// Interfaces para tipado
interface Credentials {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
  submit: string;
}

export default function LoginPage() {
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    submit: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          router.push('/users');
        }
      } catch (error) {
        // Silently fail if no token exists - user is on login page anyway
      }
    };

    checkToken();
  }, [router]);

  const validateForm = () => {
    const tempErrors: FormErrors = {
      email: '',
      password: '',
      submit: ''
    };
    let isValid = true;

    if (!credentials.email.trim()) {
      tempErrors.email = 'El email es requerido';
      isValid = false;
    }

    if (!credentials.password) {
      tempErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    setErrors({ ...tempErrors });
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    setErrors(prev => ({
      ...prev,
      [name]: '',
      submit: '' // Limpiar errores generales también
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Bypass login - go directly to users page
    router.push('/users');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg shadow-lg">
        <div>
          <h2 className={`${textStyles.h2} text-center text-foreground`}>Mental Support</h2>
          <p className={`${textStyles.body} text-center text-muted-foreground mt-2`}>
          Todo falla... menos nosotros.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className={`${inputStyles.base} ${inputStyles.sizes.md} mt-1`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                className={`${inputStyles.base} ${inputStyles.sizes.md} mt-1`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="text-red-400 text-sm text-center">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyles.base} ${buttonStyles.sizes.md} w-full bg-primary text-primary-foreground hover:opacity-90`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}