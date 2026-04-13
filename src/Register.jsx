import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');

    // 1. Sign up sa Supabase Auth
    // Isinasama natin ang full_name sa metadata para mabasa ng SQL Trigger mo
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      alert("Error signing up: " + error.message);
    } else {
      // HINDI na natin kailangan ang manual insert dito dahil sa SQL Trigger.
      // Ang database na mismo ang gagawa ng row sa 'profiles' table.
      
      alert("Registration Successful! Please check your email for verification.");
      navigate('/'); // Balik sa login page
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 border-t-8 border-amber-600 shadow-2xl">
        <h2 className="text-3xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">Create Account</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">Join Villa Anju Private Resort</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Name</label>
            <input 
              name="fullName" 
              type="text" 
              required 
              className="w-full border-2 border-slate-100 p-3 text-sm focus:border-amber-500 outline-none transition-all" 
              placeholder="Juan Dela Cruz" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full border-2 border-slate-100 p-3 text-sm focus:border-amber-500 outline-none transition-all" 
              placeholder="name@email.com" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full border-2 border-slate-100 p-3 text-sm focus:border-amber-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F172A] text-white py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Already have an account? <span onClick={() => navigate('/')} className="text-amber-600 cursor-pointer hover:underline">Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Register;