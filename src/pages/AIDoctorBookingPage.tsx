import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Phone, MessageSquare, MapPin, 
  User, CheckCircle, AlertTriangle, Coffee, ShieldAlert, X, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  age: string;
  symptoms: string;
  phone: string;
  timeSlot: string;
  tokenNumber: number;
  estArrivalTime: string;
  date: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  mapLink: string;
  timing: string;
  slotsLeft: number;
  lunchBreak: string;
  surgeryTime: string;
  emergencyAway: boolean;
  activeToken: number;
  waitingPatients: number;
  avgWaitMins: number;
  phone: string;
  whatsapp: string;
  // Visual assets (3 per doctor -> 12 total)
  docPhoto: string;
  assistantName: string;
  assistantPhoto: string;
  clinicPhoto: string;
}

const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State controls
  const [showWarningModal, setShowWarningModal] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    age: '',
    symptoms: '',
    phone: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

  // Doctors Catalog Database with rich visual assets (12 images total)
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 'doc-1',
      name: 'Dr. Neha Sharma',
      specialty: 'Pediatrician (Child Specialist)',
      address: 'Arogya Child Care Clinic, Sector 15, Noida, UP',
      mapLink: 'https://maps.google.com/?q=Sector+15+Noida',
      timing: '10:00 AM - 05:00 PM',
      slotsLeft: 4,
      lunchBreak: '01:00 PM - 02:00 PM',
      surgeryTime: '03:00 PM - 04:00 PM (Emergency Ward Rounds)',
      emergencyAway: false,
      activeToken: 8,
      waitingPatients: 2,
      avgWaitMins: 15,
      phone: '+919876543201',
      whatsapp: '919876543201',
      docPhoto: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Amit Kumar (Compounder)',
      assistantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=600&h=400&q=80'
    },
    {
      id: 'doc-2',
      name: 'Dr. Rajesh Iyer',
      specialty: 'Cardiologist (Heart Surgeon)',
      address: 'Arogya Heart Hospital, Salt Lake, Sector V, Kolkata',
      mapLink: 'https://maps.google.com/?q=Salt+Lake+Kolkata',
      timing: '02:00 PM - 07:00 PM',
      slotsLeft: 0,
      lunchBreak: 'None',
      surgeryTime: '04:00 PM - 06:30 PM (Away on Emergency Cardiac Surgery)',
      emergencyAway: true, // Emergency surgery status
      activeToken: 0,
      waitingPatients: 0,
      avgWaitMins: 0,
      phone: '+919876543202',
      whatsapp: '919876543202',
      docPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Joy Dutta (Head Assistant)',
      assistantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&h=400&q=80'
    },
    {
      id: 'doc-3',
      name: 'Dr. Amit Verma',
      specialty: 'General Physician (Family Doctor)',
      address: 'Arogya Family Clinic, Indiranagar 12th Main, Bengaluru',
      mapLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
      timing: '09:00 AM - 04:00 PM',
      slotsLeft: 5,
      lunchBreak: '01:00 PM - 02:00 PM',
      surgeryTime: 'None',
      emergencyAway: false,
      activeToken: 14,
      waitingPatients: 4,
      avgWaitMins: 10,
      phone: '+919876543203',
      whatsapp: '919876543203',
      docPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Rahul Singh (Receptionist)',
      assistantPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=400&q=80'
    },
    {
      id: 'doc-4',
      name: 'Dr. Priya Patel',
      specialty: 'Dermatologist (Skin Specialist)',
      address: 'Arogya Skin & Laser Center, Andheri West, Mumbai',
      mapLink: 'https://maps.google.com/?q=Andheri+West+Mumbai',
      timing: '11:00 AM - 03:00 PM',
      slotsLeft: 6,
      lunchBreak: 'None',
      surgeryTime: '12:30 PM - 01:00 PM (Laser Therapy Sessions)',
      emergencyAway: false,
      activeToken: 6,
      waitingPatients: 1,
      avgWaitMins: 12,
      phone: '+919876543204',
      whatsapp: '919876543204',
      docPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Sneha Shah (Clinical Associate)',
      assistantPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=600&h=400&q=80'
    }
  ]);

  // Load appointments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arogya_doctor_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    // Token and queue estimation calculations
    const token = selectedDoctor.activeToken + selectedDoctor.waitingPatients + 1;
    const estWait = selectedDoctor.waitingPatients * selectedDoctor.avgWaitMins + selectedDoctor.avgWaitMins;
    
    const now = new Date();
    now.setMinutes(now.getMinutes() + estWait);
    const estArrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAppointment: Appointment = {
      id: 'app-' + Date.now(),
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      patientName: bookingForm.patientName,
      age: bookingForm.age,
      symptoms: bookingForm.symptoms,
      phone: bookingForm.phone,
      timeSlot: selectedSlot,
      tokenNumber: token,
      estArrivalTime,
      date: selectedDate
    };

    // Store in LocalStorage
    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(updatedAppointments));

    // Decrement slots left and increment queue count in state
    setDoctors(prev => prev.map(doc => {
      if (doc.id === selectedDoctor.id) {
        return {
          ...doc,
          slotsLeft: Math.max(0, doc.slotsLeft - 1),
          waitingPatients: doc.waitingPatients + 1
        };
      }
      return doc;
    }));

    setLastBookedAppointment(newAppointment);
    setShowSuccessModal(true);
  };

  const handleWhatsAppRedirect = () => {
    if (!lastBookedAppointment || !selectedDoctor) return;

    const formattedMessage = `Hi! I would like to book a slot for ${lastBookedAppointment.patientName}, Age: ${lastBookedAppointment.age}, Symptoms: ${lastBookedAppointment.symptoms} on ${lastBookedAppointment.date} at ${lastBookedAppointment.timeSlot} under ${lastBookedAppointment.doctorName}. I found your clinic on the Arogya Care App. Please confirm my appointment.`;
    
    // Construct dynamic WhatsApp Link
    const url = `https://wa.me/${selectedDoctor.whatsapp}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, '_blank');
    setShowSuccessModal(false);
  };

  // Generate 7 upcoming dates for calendar select
  const getUpcomingDates = () => {
    const dates = [];
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        raw: d.toISOString().split('T')[0],
        formatted: d.toLocaleDateString('en-US', options)
      });
    }
    return dates;
  };

  // Time slots database
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const checkSlotStatus = (doc: Doctor, slot: string) => {
    // Check if slot falls in lunch break
    if (doc.lunchBreak !== 'None') {
      const [lunchStart, lunchEnd] = doc.lunchBreak.split(' - ');
      if (slot >= lunchStart && slot <= lunchEnd) return 'LUNCH';
    }
    // Check if slot falls in surgery hours
    if (doc.surgeryTime !== 'None') {
      const match = doc.surgeryTime.match(/\d{2}:\d{2}\s*(?:AM|PM)/g);
      if (match && match.length >= 2) {
        const [sStart, sEnd] = match;
        if (slot >= sStart && slot <= sEnd) return 'SURGERY';
      }
    }
    return 'FREE';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2.5 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary-custom flex items-center gap-2">
                {t('doctorBooking')}
                <span className="text-xs bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Development Mode
                </span>
              </h1>
              <p className="text-secondary-custom mt-1 text-sm">
                Bypass traditional booking queues: configure timing slots, live checks and automated WhatsApp redirection confirmations.
              </p>
            </div>
          </div>
        </div>

        {/* Outer Visual Warn bar */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center space-x-3 mb-8">
          <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0 animate-bounce" />
          <div>
            <p className="text-xs text-orange-500 font-extrabold uppercase tracking-wide">
              {t('noPaymentApp')}
            </p>
            <p className="text-[11px] text-secondary-custom mt-0.5 font-medium leading-relaxed">
              We do not collect payments inside Arogya Care. Once booked, complete payment or links verification directly via WhatsApp with the clinic compounder or desk receptionist.
            </p>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: 3D Doctor Availability Lists & Visual Showcases (Column Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-extrabold text-primary-custom">Featured Specialists & Clinic Environment</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <motion.div
                  key={doc.id}
                  className={`bg-card-surface border rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between relative ${
                    doc.emergencyAway ? 'border-red-500/40' : 'border-card-custom'
                  }`}
                  style={{ perspective: 1000 }}
                  whileHover={!doc.emergencyAway ? {
                    scale: 1.02,
                    rotateX: 2.5,
                    rotateY: -2.5,
                    boxShadow: '0 15px 35px rgba(139, 92, 246, 0.15)'
                  } : {}}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  {/* Clinic Exterior Showcase Image (1 of the 12 photos) */}
                  <div className="h-44 w-full overflow-hidden relative">
                    <img 
                      src={doc.clinicPhoto} 
                      alt="Clinic Ward Room" 
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="text-[9px] bg-brand-gradient text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider w-max mb-1">
                        Verified Facility
                      </span>
                      <h4 className="text-white font-extrabold text-sm flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        {doc.address}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Doctor details */}
                      <div className="flex items-center space-x-3.5 mb-4">
                        <img 
                          src={doc.docPhoto} 
                          alt={doc.name} 
                          className="w-12 h-12 rounded-full object-cover border border-card-custom"
                        />
                        <div>
                          <h3 className="font-extrabold text-primary-custom text-sm">{doc.name}</h3>
                          <p className="text-[10px] text-brand-from font-extrabold uppercase tracking-wide">
                            {doc.specialty}
                          </p>
                        </div>
                      </div>

                      {/* Timeline status details */}
                      {doc.emergencyAway ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-3 flex items-start space-x-2 mb-4">
                          <ShieldAlert className="h-4.5 w-4.5 mt-0.5 flex-shrink-0 animate-pulse" />
                          <span className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                            {t('emergencyAway')}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 mb-4 text-xs font-semibold text-secondary-custom">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-2 text-brand-from" />
                            <span>Working hrs: {doc.timing}</span>
                          </div>
                          {doc.lunchBreak !== 'None' && (
                            <div className="flex items-center text-amber-500/90">
                              <Coffee className="h-3.5 w-3.5 mr-2" />
                              <span>{t('lunchBreak')}: {doc.lunchBreak}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Compounder / Assistant Profile (Photos 5-8 of the 12 photos) */}
                      <div className="bg-black/5 dark:bg-white/5 border border-card-custom rounded-2xl p-3 flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={doc.assistantPhoto} 
                            alt={doc.assistantName} 
                            className="w-9 h-9 rounded-full object-cover border border-card-custom"
                          />
                          <div>
                            <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Assigned Coordinator</span>
                            <span className="text-[10px] font-extrabold text-primary-custom">{doc.assistantName}</span>
                          </div>
                        </div>
                        <a 
                          href={doc.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-brand-gradient text-white text-[8px] font-black rounded-lg uppercase tracking-wider shadow-sm"
                        >
                          Find Desk Map
                        </a>
                      </div>

                      {/* Live Queue status board */}
                      {!doc.emergencyAway && (
                        <div className="bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl p-3 grid grid-cols-3 gap-2 mb-4 text-center">
                          <div>
                            <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">Active token</span>
                            <span className="text-sm font-black text-primary-custom">#{doc.activeToken}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-purple-500 uppercase tracking-wider font-extrabold">Wait List</span>
                            <span className="text-sm font-black text-purple-500">#{doc.waitingPatients}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-emerald-500 uppercase tracking-wider font-extrabold">Wait time</span>
                            <span className="text-sm font-black text-emerald-500">{doc.waitingPatients * doc.avgWaitMins}m</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lower button block */}
                    <div className="mt-4">
                      {doc.emergencyAway ? (
                        <a 
                          href={`tel:${doc.phone}`}
                          className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl text-xs uppercase text-center flex items-center justify-center gap-1.5"
                        >
                          <Phone className="h-4 w-4" /> {t('contactReception')}
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedDoctor(doc);
                            // Auto select first slot
                            setSelectedSlot(timeSlots[0]);
                          }}
                          className="w-full py-2.5 bg-brand-gradient text-white font-extrabold rounded-xl text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5"
                        >
                          Select Doctor & Date
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel: Calendar Grid & Booking console (Column Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Appointment scheduling panel */}
            <div className="bg-card-surface border border-card-custom rounded-3xl p-5 shadow-xl">
              <h3 className="text-lg font-extrabold text-primary-custom mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-from" /> Calendar Slot Manager
              </h3>

              {/* Step 1: Select Date */}
              <div className="mb-5">
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">
                  1. Choose Date
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {getUpcomingDates().map((dt) => (
                    <button
                      key={dt.raw}
                      onClick={() => setSelectedDate(dt.raw)}
                      className={`p-2.5 rounded-xl border text-[10px] font-extrabold text-center transition-all ${
                        selectedDate === dt.raw
                          ? 'bg-brand-gradient text-white border-transparent shadow-md'
                          : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                      }`}
                    >
                      {dt.formatted}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Doctor */}
              <div className="mb-5">
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">
                  2. Choose Specialist
                </label>
                <div className="space-y-2">
                  {doctors.filter(d => !d.emergencyAway).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setSelectedSlot(timeSlots[0]);
                      }}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        selectedDoctor?.id === doc.id
                          ? 'bg-purple-500/10 border-purple-500 text-primary-custom'
                          : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={doc.docPhoto} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <div>
                          <span className="block text-xs font-bold">{doc.name}</span>
                          <span className="block text-[9px] opacity-75">{doc.specialty}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Select Slot and view full day schedule timeline */}
              {selectedDoctor && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider">
                      3. Select Time & Full Day Schedule
                    </label>
                    <span className="text-[9px] text-emerald-500 font-extrabold uppercase">
                      {selectedDoctor.slotsLeft} slots remaining today
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const status = checkSlotStatus(selectedDoctor, slot);
                      
                      return (
                        <button
                          key={slot}
                          disabled={status !== 'FREE'}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold text-center flex flex-col justify-center items-center transition-all ${
                            status === 'LUNCH'
                              ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 opacity-60 cursor-not-allowed'
                              : status === 'SURGERY'
                              ? 'bg-red-500/10 border-red-500/25 text-red-500 opacity-60 cursor-not-allowed'
                              : selectedSlot === slot
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md'
                              : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                          }`}
                        >
                          <span>{slot}</span>
                          <span className="text-[8px] opacity-60 mt-0.5">
                            {status === 'LUNCH' ? 'Lunch' : status === 'SURGERY' ? 'Surgery' : 'Free'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking console Form inputs */}
              {selectedDoctor && selectedSlot && (
                <motion.form 
                  onSubmit={handleBookingSubmit} 
                  className="space-y-4 pt-4 border-t border-card-custom"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-1.5">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.patientName}
                      onChange={e => setBookingForm({...bookingForm, patientName: e.target.value})}
                      placeholder="e.g. Abhijit Chauhan"
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-1.5">
                        Age
                      </label>
                      <input
                        type="number"
                        required
                        value={bookingForm.age}
                        onChange={e => setBookingForm({...bookingForm, age: e.target.value})}
                        placeholder="e.g. 21"
                        className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingForm.phone}
                        onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-1.5">
                      Describe Symptoms
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.symptoms}
                      onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}
                      placeholder="e.g. High fever, headache"
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                  >
                    Generate Slot Token & Book
                  </button>
                </motion.form>
              )}
            </div>

            {/* My Active Bookings */}
            {appointments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-md font-extrabold text-primary-custom">My Active Appointment Records</h3>
                {appointments.map((app) => (
                  <motion.div
                    key={app.id}
                    className="bg-card-surface border border-card-custom rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm relative overflow-hidden"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-primary-custom">{app.doctorName}</h4>
                      <p className="text-[10px] text-secondary-custom mt-0.5">
                        Patient: <span className="font-bold">{app.patientName}</span> ({app.age} Yrs) | Symptoms: {app.symptoms}
                      </p>
                      <p className="text-[10px] text-brand-from font-bold mt-1">
                        Date: {app.date} | Time slot: {app.timeSlot}
                      </p>
                    </div>

                    <div className="mt-3 md:mt-0 flex items-center space-x-3 pl-4 border-t md:border-t-0 md:border-l border-card-custom pt-3 md:pt-0">
                      <div className="text-right">
                        <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">Queue position</span>
                        <span className="text-sm font-black text-brand-from">#{app.tokenNumber}</span>
                      </div>
                      <div className="text-right pl-3 border-l border-card-custom">
                        <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">Consult Arrival</span>
                        <span className="text-sm font-black text-emerald-500">{app.estArrivalTime}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Entry warning modal (Development Mode) */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
            <motion.div 
              className="bg-card-surface border border-card-custom rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-14 h-14 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-black text-primary-custom text-center mb-1 flex items-center justify-center gap-2">
                🚧 Development Mode Notice
              </h3>
              <p className="text-[10px] text-orange-500 uppercase tracking-widest font-black text-center mb-6">
                डेवलपमेंट मोड सूचना
              </p>

              <div className="space-y-4 text-xs leading-relaxed text-secondary-custom max-h-64 overflow-y-auto pr-1">
                <div className="p-3 bg-white/5 border border-card-custom rounded-2xl">
                  <p className="font-bold text-primary-custom mb-1">English Notification:</p>
                  <p>
                    Please note that this feature is currently in **Development Mode**. All doctor availability, slots, working hours, active tokens, and waiting lists are mock simulated data. In future updates, this feature will be integrated with hospital APIs to sync live coordinates and data.
                  </p>
                </div>

                <div className="p-3 bg-white/5 border border-card-custom rounded-2xl">
                  <p className="font-bold text-primary-custom mb-1">हिंदी अधिसूचना (Hindi):</p>
                  <p>
                    कृपया ध्यान दें कि यह फ़ीचर वर्तमान में **डेवलपमेंट मोड** में है। सभी डॉक्टरों की उपलब्धता, टाइम स्लॉट, वर्किंग ऑवर्स, एक्टिव टोकन और वेटिंग लिस्ट मॉक सिम्युलेटेड डेटा हैं। आगामी अपडेट में, इस फ़ीचर को लाइव डेटा सिंक करने के लिए वास्तविक अस्पताल APIs के साथ एकीकृत किया जाएगा।
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="w-full py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider"
                >
                  I Understand / समझ गया (Proceed)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Congratulations Modal with WhatsApp Redirection */}
      <AnimatePresence>
        {showSuccessModal && lastBookedAppointment && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
            <motion.div 
              className="bg-card-surface border border-card-custom rounded-3xl p-6 w-full max-w-md shadow-2xl text-center relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <CheckCircle className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-black text-primary-custom mb-1">🎉 Congratulations!</h3>
              <p className="text-xs text-secondary-custom mb-6">
                Your slot token has been reserved successfully inside Arogya Care.
              </p>

              <div className="bg-black/10 dark:bg-white/5 border border-card-custom rounded-2xl p-4 text-left space-y-2 text-xs mb-6 font-semibold">
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Specialist:</span>
                  <span className="text-primary-custom">{lastBookedAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Date & Time:</span>
                  <span className="text-primary-custom">{lastBookedAppointment.date} at {lastBookedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-card-custom pt-2 mt-2">
                  <span className="text-secondary-custom">Queue Token:</span>
                  <span className="text-brand-from font-black">#{lastBookedAppointment.tokenNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Est. Consulting Arrival:</span>
                  <span className="text-emerald-500 font-black">{lastBookedAppointment.estArrivalTime}</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
              >
                <MessageSquare className="h-4.5 w-4.5" /> Confirm Appointment on WhatsApp
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIDoctorBookingPage;
