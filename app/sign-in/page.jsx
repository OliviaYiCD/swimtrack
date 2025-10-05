'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    // success -> go home
    window.location.href = '/';
  };

  const handleGoogleSignIn = async () => {
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/' },
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Sign In</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In with Email'}
          </button>
        </form>

        <div className="my-6 h-px bg-gray-800" />

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded bg-red-500 hover:bg-red-400"
        >
          Continue with Google
        </button>

        {err && <p className="text-red-400 mt-4 text-sm">{err}</p>}

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{' '}
          <a href="/sign-up" className="text-blue-400 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}