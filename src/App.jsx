import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './Register';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin'; // <-- SIGURADUHING NASA TAAS ITO
import { supabase } from './supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      // Logic para sa redirection
      if (email === 'admin@gmail.com') {
        // DAPAT TUMUGMA SA PATH SA BABA (/admin-dashboard)
        navigate('/admin-dashboard'); 
      } else {
        navigate('/dashboard'); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row font-sans">
      <div className="relative hidden w-1/2 md:block">
        <img src="/villa-anju-gate.jpg" alt="Villa Anju Gate" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold tracking-tight">Experience Serenity</h1>
          <p className="mt-4 text-xl opacity-90">Your gateway to a perfect getaway.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-bold text-slate-800">Villa Anju</h2>
            <p className="text-slate-500 font-medium">Resort Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase">Email Address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@resort.com" 
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-md bg-[#2D3E50] p-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#1e2a36] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-bold text-blue-600 hover:underline">Create a New Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Guest Side */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Side */}
        {/* Pag tinype ang /admin, lalabas ang AdminLogin page */}
        <Route path="/admin" element={<AdminLogin />} />
        
        {/* Pag naka-login na, pupunta rito sa may table */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}