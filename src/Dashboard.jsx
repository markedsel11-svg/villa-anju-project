import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import BookingModal from './BookingModal'; // --- IMPORT NATIN YUNG MODAL ---

function Dashboard() {
  const navigate = useNavigate();
  
  // State para sa Modal/Full View ng Image
  const [selectedImg, setSelectedImg] = useState(null);
  const [userName, setUserName] = useState('Loading...');
  const [dbReservations, setDbReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE PARA SA BOOKING MODAL ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- FETCH USER & RESERVATIONS FUNCTION ---
  // Ginawa nating hiwalay na function para matatawag natin ulit pagkatapos mag-book
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Kunin ang current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      navigate('/'); 
      return;
    }

    setCurrentUserId(user.id); // I-save ang ID para sa modal

    // 2. Kunin ang Name sa Profiles Table
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) console.error("Profile fetch error:", profileError);

      if (profile && profile.full_name) {
        setUserName(profile.full_name);
      } else {
        const metaName = user.user_metadata?.full_name;
        if (metaName) {
          setUserName(metaName);
        } else {
          setUserName(user.email.split('@')[0]);
        }
      }
    } catch (err) {
      setUserName(user.email.split('@')[0]);
    }

    // 3. Kunin ang Reservations ng user
    const { data: resData, error: resError } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!resError) {
      setDbReservations(resData || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const [amenities] = useState([
    { title: 'MAIN POOL', desc: 'Adult & Kiddie', image: '/poolmain.jpg' },
    { title: 'EVENT PAVILION', desc: 'Indoor Venue', image: '/pavillion.jpg' },
    { title: 'Room 1', desc: 'Single Bed With AC', image: '/room1.jpg' },
    { title: 'Room 2', desc: 'Full Size Bed With AC', image: '/room2.jpg' },
    { title: 'Room 3', desc: 'Double Deck With AC', image: '/room3.jpg' },
    { title: 'Pool at Night', desc: 'Warm Lighting', image: '/night.jpg' },
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      
      {/* --- BOOKING MODAL COMPONENT --- */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        userId={currentUserId}
        onBookingSuccess={fetchData} // I-refresh ang table pag success
      />

      {/* IMAGE MODAL */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-5xl w-full">
            <button className="absolute -top-12 right-0 text-white text-4xl font-light">&times;</button>
            <img 
              src={selectedImg} 
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300" 
              alt="Full View" 
            />
          </div>
        </div>
      )}

      {/* SOLID NAVBAR */}
      <nav className="bg-[#0F172A] text-white px-8 py-5 flex justify-between items-center shadow-lg border-b-4 border-amber-600">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter leading-none">VILLA ANJU</h1>
          <span className="text-[10px] tracking-[0.3em] text-amber-500 font-bold uppercase">Private Resort</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-slate-700 pr-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Welcome back,</p>
            <p className="text-sm font-bold text-white uppercase tracking-tight">{userName}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-6 py-2 rounded-md transition-all uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* GALLERY SECTION */}
        <section className="mb-16">
          <div className="border-l-8 border-amber-500 pl-6 mb-10">
            <h2 className="text-4xl font-black text-[#0F172A] uppercase tracking-tight">The Experience</h2>
            <p className="text-slate-500 font-medium mt-1">Exclusive comfort tailored for your relaxation.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedImg(item.image)}
                className="group bg-white border-2 border-slate-200 rounded-none overflow-hidden hover:border-amber-500 transition-all duration-300 shadow-md cursor-zoom-in"
              >
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  <img 
                    src={item.image} 
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    alt={item.title}
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${i+10}/600/400`; }}
                  />
                  <div className="absolute top-0 right-0 bg-amber-500 text-[#0F172A] text-[10px] font-black px-4 py-1.5">
                    0{i + 1}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-xl text-[#0F172A] mb-1">{item.title}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RESERVATIONS TABLE */}
        <section className="bg-white border-2 border-[#0F172A] overflow-hidden shadow-2xl">
          <div className="bg-[#0F172A] p-6 flex justify-between items-center">
            <h2 className="text-white font-black text-xl tracking-wide uppercase">My Reservations</h2>
            {/* --- I-UPDATE NATIN ITONG BUTTON PARA BUKSAN ANG MODAL --- */}
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-amber-600 text-white px-6 py-2.5 rounded-none font-black text-xs hover:bg-amber-500 transition-all uppercase tracking-tighter"
            >
              + Book a New Room
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[#0F172A] text-xs font-black uppercase border-b-2 border-slate-200">
                  <th className="p-6">Reference No.</th>
                  <th className="p-6">Room Type</th>
                  <th className="p-6">Check-in</th>
                  <th className="p-6">Check-out</th>
                  <th className="p-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbReservations.length > 0 ? (
                  dbReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-6 font-bold text-amber-700">{res.ref_no}</td>
                      <td className="p-6 text-sm font-semibold">{res.room_type}</td>
                      {/* I-format natin ang date para maganda tignan */}
                      <td className="p-6 text-sm font-semibold">{new Date(res.check_in).toLocaleDateString('en-US')}</td>
                      <td className="p-6 text-sm font-semibold">{new Date(res.check_out).toLocaleDateString('en-US')}</td>
                      <td className="p-6 text-center">
                        <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${res.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                      {loading ? "Fetching your data..." : "No active reservations found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 bg-[#0F172A] p-12 grid grid-cols-1 md:grid-cols-2 gap-10 text-white border-t-8 border-amber-600">
          <div>
            <h4 className="text-amber-500 font-black text-[10px] tracking-[0.4em] mb-4 uppercase">Resort Location</h4>
            <p className="text-lg font-bold leading-tight italic opacity-90">
              660 Pagasa Street, Brgy. Sta. Cruz,<br />
              Sta. Maria Bulacan
            </p>
          </div>
          <div className="md:text-right flex flex-col justify-end">
            <h4 className="text-amber-500 font-black text-[10px] tracking-[0.4em] mb-2 uppercase">Official Inquiries</h4>
            <p className="text-4xl font-black text-white tracking-tighter italic">0912 519 0268</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;