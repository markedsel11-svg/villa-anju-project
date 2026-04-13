import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Access Denied: " + error.message);
    } else if (data.user.email !== 'admin@gmail.com') {
      alert("Unauthorized! This portal is for admins only.");
      await supabase.auth.signOut();
    } else {
      // Kapag admin talaga, pasok sa dashboard
      navigate('/admin-dashboard'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 font-sans">
      <div className="w-full max-w-sm bg-white p-8 border-t-4 border-amber-500 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">Admin Portal</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Villa Estella Management</p>
        </div>
        
        <form onSubmit={handleAdminAuth} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Administrator Email</label>
            <input 
              type="email" 
              required
              className="w-full border-2 border-slate-100 p-3 outline-none focus:border-amber-500 transition-all font-bold text-slate-700"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Security Password</label>
            <input 
              type="password" 
              required
              className="w-full border-2 border-slate-100 p-3 outline-none focus:border-amber-500 transition-all font-bold text-slate-700"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black p-4 uppercase hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Control Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;