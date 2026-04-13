import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('Pending Verification'); // Tabs: 'Pending Verification', 'Approved', 'Rejected'
  const navigate = useNavigate();

  // 1. Function para kuhanin ang lahat ng bookings
  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    // Simple select lang para siguradong gagana
    const { data, error } = await supabase
      .from('reservations')
      .select('*') 
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error:", error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }, []);

  // 2. Security Check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'admin@gmail.com') {
        navigate('/admin'); 
        return;
      }
      fetchAllBookings();
    };
    checkAdmin();
  }, [navigate, fetchAllBookings]);

  // 3. Update Status (Approve/Reject)
  const handleStatusUpdate = async (id, newStatus) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(`Successfully moved to ${newStatus}`);
      fetchAllBookings(); // Refresh the list
    }
  };

  // 4. Filter bookings base sa napiling Tab
  const filteredBookings = bookings.filter(b => b.status === currentTab);

  if (loading && bookings.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-sans">
        <p className="font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Admin Dashboard</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Villa Anju Management</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[10px] font-black uppercase border-2 border-slate-900 px-6 py-2 hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white"
          >
            ← Back to User View
          </button>
        </header>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['Pending Verification', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${
                currentTab === tab 
                ? 'bg-slate-900 text-white translate-x-[2px] translate-y-[2px] shadow-none' 
                : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab === 'Pending Verification' ? 'Pending' : tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-4">Ref No</th>
                <th className="p-4">Room / Details</th>
                <th className="p-4">Check-in/Out</th>
                <th className="p-4 text-center">Receipt</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900/5">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-amber-600 uppercase italic">#{res.ref_no}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 uppercase text-sm">{res.room_type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Price: ₱{res.total_price}</p>
                    </td>
                    <td className="p-4 text-[11px] font-bold text-slate-600">
                      <div>IN: {res.check_in}</div>
                      <div>OUT: {res.check_out}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          const { data } = supabase.storage.from('bookings').getPublicUrl(res.receipt_url);
                          window.open(data.publicUrl, '_blank');
                        }}
                        className="text-[9px] font-black uppercase bg-white border-2 border-slate-900 px-3 py-1 hover:bg-slate-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        View Proof
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {currentTab === 'Pending Verification' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(res.id, 'Approved')}
                            className="bg-emerald-500 text-white text-[9px] font-black px-3 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 uppercase"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(res.id, 'Rejected')}
                            className="bg-red-500 text-white text-[9px] font-black px-3 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 uppercase"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {currentTab !== 'Pending Verification' && (
                        <span className="text-[9px] font-black uppercase text-slate-400 italic">No actions needed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-[0.5em]">
                    Empty {currentTab}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;