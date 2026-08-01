import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../components/auth-provider.js';
import { API_BASE_URL } from '../lib/utils.js';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const { user, token } = response.data;
      login(user, token);
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <LogIn className="text-indigo-500 h-6 w-6" /> Sign In
        </h1>
        <p className="text-xs text-slate-500">
          Access your personal workspace and snippet library.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Mail size={12} /> Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <KeyRound size={12} /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            <button
              type="button"
              disabled={loading}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-1.5 leading-normal">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors disabled:opacity-50"
        >
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-500 hover:underline font-semibold">
          Create account
        </Link>
      </div>
    </div>
  );
}
