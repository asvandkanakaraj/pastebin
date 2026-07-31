import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, UserPlus, AlertCircle } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        email: email.trim(),
        password,
      });

      // Redirect to login on success
      navigate('/login');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <UserPlus className="text-indigo-500 h-6 w-6" /> Create Account
        </h1>
        <p className="text-xs text-slate-500">
          Sign up to unlock dashboard management and history listings.
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
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
          />
        </div>

        {/* Confirm Password Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <KeyRound size={12} /> Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
          />
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
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-500 hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
