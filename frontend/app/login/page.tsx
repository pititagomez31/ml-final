'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, AlertCircle, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login({ username: username.trim(), password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        router.push('/admin');
      } else {
        setErrorMsg('Respuesta de autenticación no válida.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciales incorrectas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] text-zinc-900 flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <a href="/" className="font-serif text-2xl font-bold tracking-tight inline-block mb-2">
            ML Mimo Mento Nails Studio<span className="text-[#c57d62]">.</span>
          </a>
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Acceso Administrativo
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 size-4 text-zinc-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario de administración"
                className="w-full pl-10 p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38312d] text-white py-3.5 uppercase tracking-widest text-xs font-semibold hover:bg-[#c57d62] transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
          <a href="/" className="text-xs text-zinc-500 hover:text-zinc-900 transition">
            &larr; Volver al sitio principal
          </a>
        </div>
      </div>
    </div>
  );
}
