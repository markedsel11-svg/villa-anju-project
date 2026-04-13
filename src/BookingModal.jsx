import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function BookingModal({ isOpen, onClose, userId, onBookingSuccess }) {
  const basePrice = 2500;
  const extraRoomPrice = 500;

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [extraRooms, setExtraRooms] = useState(0);
  const [totalAmount, setTotalAmount] = useState(basePrice);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kunin ang date ngayon para sa 'min' attribute ng date input
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const newTotal = basePrice + (extraRooms * extraRoomPrice);
    setTotalAmount(newTotal);
  }, [extraRooms]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const generateRefNo = () => {
    return 'VA-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!checkIn || !checkOut || !receiptFile) {
      alert("Please fill in all fields and upload your payment receipt.");
      return;
    }

    // 1. Logic: Check-out must be after Check-in
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);

    try {
      // 2. Availability Check: Siguraduhin na walang Approved booking sa piniling dates
      // 2. Availability Check: Lahat ng hindi Rejected, bawal sapawan
const { data: conflicts, error: checkError } = await supabase
  .from('reservations')
  .select('*')
  .neq('status', 'Rejected') // Lahat ng status (Approved, Pending) wag isama ang Rejected
  .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`); // Mas strict na overlap logic

if (checkError) throw checkError;

if (conflicts && conflicts.length > 0) {
  alert("Sorry, those dates are already booked or have a pending reservation. Please try choosing another date.");
  setLoading(false);
  return;
}

      const refNo = generateRefNo();
      
      // 3. Upload Receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${refNo}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('bookings')
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      // 4. Insert Booking Data
      const { error: dbError } = await supabase
        .from('reservations')
        .insert([
          {
            user_id: userId,
            ref_no: refNo,
            room_type: extraRooms === 0 ? 'Default (2 Rooms)' : `${2 + parseInt(extraRooms)} Rooms Total`,
            check_in: checkIn,
            check_out: checkOut,
            status: 'Pending Verification',
            total_price: totalAmount,
            receipt_url: filePath
          }
        ]);

      if (dbError) throw dbError;

      alert("Booking confirmed! Please wait for admin verification.");
      onBookingSuccess(); 
      onClose(); 
      
      setCheckIn('');
      setCheckOut('');
      setExtraRooms(0);
      setReceiptFile(null);

    } catch (error) {
      console.error("Booking Error:", error.message);
      alert("Failed to confirm booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-[#007BFF]/20">
        
        <div className="bg-[#007BFF] p-6 text-white text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight italic">Villa Anju</h2>
          <p className="text-sm font-bold opacity-90">Online Reservation Form</p>
        </div>

        <form onSubmit={handleConfirmBooking} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Check-in</label>
              <input 
                type="date" 
                required 
                min={today} // Gray out past dates
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm font-bold focus:border-[#007BFF] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Check-out</label>
              <input 
                type="date" 
                required 
                min={checkIn || today} // Gray out past dates & dates before check-in
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm font-bold focus:border-[#007BFF] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Extra Rooms (₱500 each)</label>
            <select 
              value={extraRooms}
              onChange={(e) => setExtraRooms(parseInt(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-lg p-3 text-sm font-bold focus:border-[#007BFF] outline-none transition-all appearance-none bg-white cursor-pointer"
            >
              <option value={0}>Default (2 Rooms)</option>
              <option value={1}>1 Extra Room (+₱500)</option>
              <option value={2}>2 Extra Rooms (+₱1,000)</option>
              <option value={3}>3 Extra Rooms (+₱1,500)</option>
            </select>
          </div>

          <div className="bg-[#F0F8FF] border-2 border-dashed border-[#007BFF] rounded-xl p-6 text-center shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Amount</p>
            <p className="text-4xl font-black text-[#007BFF] tracking-tighter italic">
              ₱{totalAmount.toLocaleString('en-US')}
            </p>
          </div>

          <div className="border-2 border-slate-100 rounded-2xl p-6 space-y-4 bg-slate-50/50">
            <p className="text-center text-[10px] font-black uppercase text-[#007BFF] tracking-[0.2em]">GCASH PAYMENT</p>
            
            <div className="flex justify-center">
              <div className="p-2 bg-white border-2 border-[#007BFF] rounded-xl shadow-md">
                <img src="/qrcode.jpg" alt="GCash QR Code" className="w-32 h-32 object-contain" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Upload Receipt</label>
              <input 
                type="file" 
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#007BFF] file:text-white hover:file:bg-[#0066D6] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#007BFF] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0px_4px_0px_0px_#0056b3] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
            >
              {loading ? "CHECKING AVAILABILITY..." : "CONFIRM BOOKING"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all"
            >
              ← Cancel & Back
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default BookingModal;