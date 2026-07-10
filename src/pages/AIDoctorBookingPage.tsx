import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Phone, MessageSquare, MapPin, 
  User, CheckCircle, AlertTriangle, Coffee, ShieldAlert, Trash2, ShieldCheck, Check, Star, Award, Briefcase, Heart, BookOpen, Compass
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
  qualifications: string;
  experienceYears: number;
  rating: number;
  consultsCount: number;
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
  personality: string;
  // Visual assets (multiple per doctor)
  docPhoto: string;
  assistantName: string;
  assistantPhoto: string;
  clinicPhoto: string;
  degreePhoto: string;
  examPhoto: string;
  services: string[];
  gallery: string[];
}

const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Wizard Steps: 1 = Full-Screen Warning Disclaimer, 2 = Doctors List, 3 = About Doctor, 4 = About Clinic & Degrees, 5 = Booking Slot & Form
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    age: '',
    symptoms: '',
    phone: ''
  });
  
  const [duplicateError, setDuplicateError] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

  // Doctors Catalog Database with rich visual assets (more than 10+ images in total)
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 'doc-1',
      name: 'Dr. Neha Sharma',
      specialty: 'Pediatrician (Child Specialist)',
      qualifications: 'MBBS, MD (Pediatrics) - AIIMS Delhi, DCH (London)',
      experienceYears: 16,
      rating: 4.9,
      consultsCount: 2450,
      address: 'Arogya Child Care Clinic, Sector 15, Noida, UP',
      mapLink: 'https://maps.google.com/?q=Sector+15+Noida',
      timing: '10:00 AM - 05:00 PM',
      slotsLeft: 4,
      lunchBreak: '01:00 PM - 02:00 PM',
      surgeryTime: '03:00 PM - 04:00 PM (Emergency Ward Rounds)',
      emergencyAway: false,
      activeToken: 5,
      waitingPatients: 2,
      avgWaitMins: 15,
      phone: '+919876543201',
      whatsapp: '919876543201',
      personality: 'Warm, patient, child-friendly and extremely empathetic towards pediatric checkups and neonatal diagnostics.',
      docPhoto: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Amit Kumar (Compounder)',
      assistantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Childhood Immunizations', 'Growth & Nutrition Assessment', 'Newborn Screening'],
      gallery: [
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&h=300&q=80'
      ]
    },
    {
      id: 'doc-2',
      name: 'Dr. Rajesh Iyer',
      specialty: 'Cardiologist (Heart Specialist)',
      qualifications: 'MBBS, MD (Medicine), DM (Cardiology) - BHU, FACC (USA)',
      experienceYears: 22,
      rating: 5.0,
      consultsCount: 4120,
      address: 'Arogya Heart Hospital, Salt Lake, Sector V, Kolkata',
      mapLink: 'https://maps.google.com/?q=Salt+Lake+Kolkata',
      timing: '02:00 PM - 07:00 PM',
      slotsLeft: 0,
      lunchBreak: 'None',
      surgeryTime: '04:00 PM - 06:30 PM (Emergency Heart Surgery)',
      emergencyAway: true,
      activeToken: 0,
      waitingPatients: 0,
      avgWaitMins: 0,
      phone: '+919876543202',
      whatsapp: '919876543202',
      personality: 'Highly analytical, calm under pressure, and dedicated to coronary angiography therapies and critical cardiac surgeries.',
      docPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Joy Dutta (Head Assistant)',
      assistantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Angiography & Angioplasty', 'Echocardiography (ECG)', 'Hypertension Management'],
      gallery: [
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=400&h=300&q=80'
      ]
    },
    {
      id: 'doc-3',
      name: 'Dr. Amit Verma',
      specialty: 'General Physician (Family Doctor)',
      qualifications: 'MBBS, MD (General Medicine) - KMC Manipal',
      experienceYears: 12,
      rating: 4.8,
      consultsCount: 3100,
      address: 'Arogya Family Clinic, Indiranagar 12th Main, Bengaluru',
      mapLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
      timing: '09:00 AM - 04:00 PM',
      slotsLeft: 5,
      lunchBreak: '01:00 PM - 02:00 PM',
      surgeryTime: 'None',
      emergencyAway: false,
      activeToken: 12,
      waitingPatients: 4,
      avgWaitMins: 10,
      phone: '+919876543203',
      whatsapp: '919876543203',
      personality: 'Friendly, active listener, structured in diagnostic checkups and routine health reviews.',
      docPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Rahul Singh (Receptionist)',
      assistantPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Chronic Disease Management', 'Diagnostic Preventive Health checkups', 'Infectious Diseases Therapy'],
      gallery: [
        'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300&q=80'
      ]
    },
    {
      id: 'doc-4',
      name: 'Dr. Priya Patel',
      specialty: 'Dermatologist (Skin Specialist)',
      qualifications: 'MBBS, DDVL - Grant Medical College Mumbai',
      experienceYears: 14,
      rating: 4.9,
      consultsCount: 2890,
      address: 'Arogya Skin & Laser Center, Andheri West, Mumbai',
      mapLink: 'https://maps.google.com/?q=Andheri+West+Mumbai',
      timing: '11:00 AM - 03:00 PM',
      slotsLeft: 6,
      lunchBreak: 'None',
      surgeryTime: '12:30 PM - 01:00 PM (Laser Therapy Sessions)',
      emergencyAway: false,
      activeToken: 8,
      waitingPatients: 1,
      avgWaitMins: 12,
      phone: '+919876543204',
      whatsapp: '919876543204',
      personality: 'Highly professional, skincare expert, specializing in advanced laser therapies, acne treatment, and clinical cosmetics.',
      docPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Sneha Shah (Clinical Associate)',
      assistantPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1588600878108-57c6b1e4b4d1?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Laser Acne Scar Treatment', 'Anti-Aging Therapy', 'Clinical Dermatitis & Eczema care'],
      gallery: [
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300&q=80'
      ]
    }
  ]);

  // Load appointments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arogya_doctor_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError('');
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    // Check duplicate booking name
    const targetName = bookingForm.patientName.trim().toLowerCase();
    const hasDuplicate = appointments.some(
      app => app.patientName.trim().toLowerCase() === targetName
    );

    if (hasDuplicate) {
      setDuplicateError('Duplicate Booking Detected: An active slot is already reserved for this patient name. Please cancel your existing appointment or use a different patient name.');
      return;
    }

    // Token and queue arrival estimations
    const token = selectedDoctor.activeToken + selectedDoctor.waitingPatients + 1;
    const estWait = selectedDoctor.waitingPatients * selectedDoctor.avgWaitMins + selectedDoctor.avgWaitMins;
    
    const now = new Date();
    now.setMinutes(now.getMinutes() + estWait);
    const estArrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAppointment: Appointment = {
      id: 'app-' + Date.now(),
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      patientName: bookingForm.patientName.trim(),
      age: bookingForm.age,
      symptoms: bookingForm.symptoms,
      phone: bookingForm.phone,
      timeSlot: selectedSlot,
      tokenNumber: token,
      estArrivalTime,
      date: selectedDate
    };

    // Store in state and LocalStorage
    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(updatedAppointments));

    // Decrement slots count and update waiting Patients count
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
    setBookingStep(5); // Switch to Step 5: congratulations success screen
  };

  const handleWhatsAppRedirect = () => {
    if (!lastBookedAppointment || !selectedDoctor) return;

    const formattedMessage = `Hi! I would like to book a slot for ${lastBookedAppointment.patientName}, Age: ${lastBookedAppointment.age}, Symptoms: ${lastBookedAppointment.symptoms} on ${lastBookedAppointment.date} at ${lastBookedAppointment.timeSlot} under ${lastBookedAppointment.doctorName}. I found your clinic on the Arogya Care App. Please confirm my appointment.`;
    
    const url = `https://wa.me/${selectedDoctor.whatsapp}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, '_blank');
    setBookingStep(2); // Go back to Doctor selection
  };

  const handleCancelAppointment = (appId: string, doctorName: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;

    // Filter appointments
    const filtered = appointments.filter(app => app.id !== appId);
    setAppointments(filtered);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(filtered));

    // Restore slot in doctor's state
    setDoctors(prev => prev.map(doc => {
      if (doc.name === doctorName) {
        return {
          ...doc,
          slotsLeft: Math.min(8, doc.slotsLeft + 1),
          waitingPatients: Math.max(0, doc.waitingPatients - 1)
        };
      }
      return doc;
    }));
  };

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

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const checkSlotStatus = (doc: Doctor, slot: string) => {
    if (doc.lunchBreak !== 'None') {
      const [lunchStart, lunchEnd] = doc.lunchBreak.split(' - ');
      if (slot >= lunchStart && slot <= lunchEnd) return 'LUNCH';
    }
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
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (bookingStep === 2) {
                  setBookingStep(1); // Go back to warning disclaimer
                } else if (bookingStep > 2 && bookingStep < 5) {
                  setBookingStep(2); // Go back to doctor list selection
                } else if (bookingStep === 5) {
                  setBookingStep(2); // Congratulations back to doctor list
                } else {
                  navigate('/dashboard');
                }
              }}
              className="mr-4 p-2.5 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all cursor-pointer border border-card-custom"
            >
              <ArrowLeft className="h-5 w-5 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary-custom flex items-center gap-2">
                {t('doctorBooking')}
                <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Development Preview
                </span>
              </h1>
              <p className="text-secondary-custom mt-1 text-sm">
                Interactive clinic scheduling timeline, verification credentials, clinical degree lists and direct WhatsApp redirect URL creator.
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {bookingStep > 1 && (
            <div className="hidden md:flex items-center space-x-2 bg-card-surface border border-card-custom px-4 py-2 rounded-2xl shadow-sm">
              {[2, 3, 4, 5].map((st) => (
                <div key={st} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    bookingStep === st
                      ? 'bg-brand-gradient text-white shadow-md'
                      : bookingStep > st
                      ? 'bg-green-500 text-white'
                      : 'bg-black/5 dark:bg-white/5 text-secondary-custom border border-card-custom'
                  }`}>
                    {bookingStep > st ? <Check className="w-3.5 h-3.5" /> : st - 1}
                  </div>
                  {st < 5 && <div className={`w-6 h-0.5 mx-1.5 ${bookingStep > st ? 'bg-green-500' : 'bg-card-custom'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wizard Multi-Step Animation Panels */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Exclusive Warning Disclaimer Overlay */}
          {bookingStep === 1 && (
            <motion.div 
              key="step-warning-overlay"
              className="max-w-2xl mx-auto bg-card-surface border-2 border-red-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-red-500" />
              
              {/* 3D Pulse Warning Logo */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-40 animate-pulse" />
                <div className="relative z-10 w-full h-full rounded-full bg-card-surface border-2 border-red-500/30 flex items-center justify-center">
                  <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
              </div>

              <h2 className="text-3xl font-black text-primary-custom text-center tracking-tight mb-1 uppercase">
                DEVELOPMENT MODE WARNING
              </h2>
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-black text-center mb-8">
                Arogya Care Clinical Sandbox
              </p>

              <div className="p-4 bg-red-500/[0.02] border border-red-500/10 rounded-2xl text-xs text-secondary-custom leading-relaxed space-y-4 my-6">
                <p>
                  This patient scheduling module is a **simulated development preview** utilizing mock database indicators. Active doctor listings, slot timing allocations, lunch breaks, and live surgery pauses are generated strictly for evaluation.
                </p>
                <p className="font-semibold text-red-400">
                  Production deployment will integrate actual hospital REST APIs. No monetary or cash payment is collected inside the application.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3.5 bg-white/5 border border-card-custom hover:bg-white/10 text-secondary-custom font-extrabold rounded-xl text-xs uppercase transition-all cursor-pointer"
                >
                  Cancel & Go Back
                </button>
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/15 cursor-pointer"
                >
                  Acknowledge & Proceed
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Doctor Directory List (Doctor photo, Name, Specialty ONLY) */}
          {bookingStep === 2 && (
            <motion.div
              key="step-doctor-directory"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-primary-custom">Choose a Specialist Doctor</h2>
                <span className="text-xs text-secondary-custom font-semibold">Step 1 of 3</span>
              </div>

              {/* Simple grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doc) => (
                  <motion.div
                    key={doc.id}
                    className="bg-card-surface border border-card-custom rounded-3xl p-5 shadow-lg flex flex-col justify-between"
                    whileHover={{ scale: 1.01, rotateX: 1.5, rotateY: -1.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center space-x-4">
                      <img 
                        src={doc.docPhoto} 
                        alt={doc.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/25 flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-primary-custom text-base flex items-center gap-1.5">
                          {doc.name}
                          {doc.emergencyAway && (
                            <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                              Away
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-brand-from font-extrabold uppercase tracking-wide">
                          {doc.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Sequential wizard options list */}
                    <div className="grid grid-cols-3 gap-2.5 mt-6 border-t border-card-custom pt-4">
                      <button
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(3); // Shift to Step 3: About Doctor
                        }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-white/10 hover:text-primary-custom text-secondary-custom font-extrabold rounded-xl text-[9px] uppercase tracking-wider text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-purple-500" />
                        <span>About Doctor</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(4); // Shift to Step 4: About Clinic
                        }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-white/10 hover:text-primary-custom text-secondary-custom font-extrabold rounded-xl text-[9px] uppercase tracking-wider text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="h-4 w-4 text-brand-from" />
                        <span>Clinic Details</span>
                      </button>

                      <button
                        disabled={doc.emergencyAway}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(5); // Shift to Step 5: Calendar Booking
                        }}
                        className="py-2.5 bg-brand-gradient text-white disabled:opacity-40 font-extrabold rounded-xl text-[9px] uppercase tracking-wider text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Detailed Doctor Bio Page (large photo, qualification, rating details) */}
          {bookingStep === 3 && selectedDoctor && (
            <motion.div
              key="step-doctor-bio"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-card-custom pb-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex items-center text-xs font-bold text-secondary-custom hover:text-primary-custom"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Doctor Directory
                </button>
                <span className="text-[10px] text-brand-from font-extrabold uppercase">Doctor Profile info</span>
              </div>

              {/* Large Portrait Layout */}
              <div className="flex flex-col items-center text-center">
                <img 
                  src={selectedDoctor.docPhoto} 
                  alt={selectedDoctor.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/25 shadow-lg mb-4"
                />
                <h3 className="text-xl font-black text-primary-custom flex items-center gap-2">
                  {selectedDoctor.name}
                  <span className="inline-flex items-center text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Star className="h-3.5 w-3.5 fill-amber-500 mr-0.5" /> {selectedDoctor.rating}
                  </span>
                </h3>
                <p className="text-xs text-brand-from font-extrabold uppercase tracking-widest mt-0.5">
                  {selectedDoctor.specialty}
                </p>
              </div>

              {/* Clinical Specs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-3 rounded-2xl text-center">
                  <Award className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <span className="block text-[8px] text-secondary-custom uppercase">Degree</span>
                  <span className="text-[10px] font-black text-primary-custom mt-0.5 truncate block">{selectedDoctor.qualifications.split(' ')[0]}</span>
                </div>
                <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-3 rounded-2xl text-center">
                  <Briefcase className="h-5 w-5 mx-auto mb-1 text-brand-from" />
                  <span className="block text-[8px] text-secondary-custom uppercase">Experience</span>
                  <span className="text-[10px] font-black text-primary-custom mt-0.5 block">{selectedDoctor.experienceYears}+ Years</span>
                </div>
                <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-3 rounded-2xl text-center">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-emerald-500 fill-emerald-500/20" />
                  <span className="block text-[8px] text-secondary-custom uppercase">Consults</span>
                  <span className="text-[10px] font-black text-primary-custom mt-0.5 block">{selectedDoctor.consultsCount}+ Logs</span>
                </div>
              </div>

              {/* Full qualifications text */}
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom rounded-2xl p-4 text-xs text-secondary-custom leading-normal space-y-2">
                <div>
                  <span className="block font-black text-primary-custom uppercase text-[8px] tracking-wider mb-0.5">Education Credentials</span>
                  <span className="font-bold">{selectedDoctor.qualifications}</span>
                </div>
                <div className="pt-2 border-t border-card-custom">
                  <span className="block font-black text-primary-custom uppercase text-[8px] tracking-wider mb-0.5">Doctor Review / Personality</span>
                  <p className="italic">"{selectedDoctor.personality}"</p>
                </div>
              </div>

              {/* Services Focus */}
              <div>
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-2">Primary Medical Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.services.map((svc, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-xl">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-card-custom flex gap-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Back to List
                </button>
                <button
                  disabled={selectedDoctor.emergencyAway}
                  onClick={() => setBookingStep(5)}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Book Appointment Slot
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: About Clinic & Degrees (Verification galleries & Mock Map address) */}
          {bookingStep === 4 && selectedDoctor && (
            <motion.div
              key="step-clinic-gallery"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-card-custom pb-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex items-center text-xs font-bold text-secondary-custom hover:text-primary-custom"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Doctor Directory
                </button>
                <span className="text-[10px] text-brand-from font-extrabold uppercase">Clinic Credentials</span>
              </div>

              {/* Gallery Title & Address description */}
              <div>
                <h3 className="font-extrabold text-primary-custom text-base">Facility & MBBS Verification Gallery</h3>
                <p className="text-[11px] text-secondary-custom mt-1">
                  Browse degree certificates, checkup rooms, lobbies, and consulting environments.
                </p>
              </div>

              {/* Grid of 10-15 Photos (combined doc photos, degree photos, exam photos and galleries) */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Degree Diploma Card (Asset 1) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                  <img src={selectedDoctor.degreePhoto} className="w-full h-full object-cover" alt="MBBS Certificate" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Degree</span>
                </div>

                {/* Exam Room Card (Asset 2) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                  <img src={selectedDoctor.examPhoto} className="w-full h-full object-cover" alt="Patient Checkup" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Exam Room</span>
                </div>

                {/* Lobby/Building Exterior Card (Asset 3) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                  <img src={selectedDoctor.clinicPhoto} className="w-full h-full object-cover" alt="Facility Exterior" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Reception</span>
                </div>

                {/* Additional gallery assets (4, 5, 6) */}
                {selectedDoctor.gallery.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                    <img src={imgUrl} className="w-full h-full object-cover" alt={`Gallery-${idx}`} />
                    <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Facility #{idx+1}</span>
                  </div>
                ))}

                {/* Compounder portrait asset (7) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                  <img src={selectedDoctor.assistantPhoto} className="w-full h-full object-cover" alt="Assistant Compounder" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Compounder</span>
                </div>

                {/* Doctor Portrait portrait asset (8) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom">
                  <img src={selectedDoctor.docPhoto} className="w-full h-full object-cover" alt="Specialist Doctor" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/75 px-1.5 py-0.5 text-white font-bold rounded">Doctor Portrait</span>
                </div>

                {/* Extra simulated mock image slots to reach 10+ photos visually (9, 10, 11) */}
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom bg-black/5 flex flex-col justify-center items-center text-center p-2.5">
                  <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  <span className="text-[7px] text-secondary-custom uppercase tracking-wider font-extrabold mt-1">Verified Care Rating</span>
                </div>
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom bg-black/5 flex flex-col justify-center items-center text-center p-2.5">
                  <Clock className="h-4.5 w-4.5 text-brand-from" />
                  <span className="text-[7px] text-secondary-custom uppercase tracking-wider font-extrabold mt-1">Flexible Schedule Check</span>
                </div>
                <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom bg-black/5 flex flex-col justify-center items-center text-center p-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  <span className="text-[7px] text-secondary-custom uppercase tracking-wider font-extrabold mt-1">Arogya Certified</span>
                </div>
              </div>

              {/* Dynamic Google Maps Address location card */}
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl space-y-3">
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider">Physical Clinic Coordinates</span>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-primary-custom font-extrabold block">Arogya Center Desk location</span>
                    <span className="text-[11px] text-secondary-custom leading-normal block">{selectedDoctor.address}</span>
                  </div>
                </div>
                <a 
                  href={selectedDoctor.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[10px] uppercase text-center block"
                >
                  Open in Google Maps Directions
                </a>
              </div>

              <div className="pt-4 border-t border-card-custom flex gap-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Back to List
                </button>
                <button
                  disabled={selectedDoctor.emergencyAway}
                  onClick={() => setBookingStep(5)}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Book Appointment Slot
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Date Selector & Calendar Time slot picking Form */}
          {bookingStep === 5 && selectedDoctor && (
            <motion.div
              key="step-booking-slots-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-card-custom pb-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex items-center text-xs font-bold text-secondary-custom hover:text-primary-custom"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Doctor Directory
                </button>
                <span className="text-[10px] text-brand-from font-extrabold uppercase">Step 3 of 3</span>
              </div>

              {/* 1. Date Selector */}
              <div>
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">
                  1. Choose Date
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {getUpcomingDates().map((dt) => (
                    <button
                      key={dt.raw}
                      onClick={() => setSelectedDate(dt.raw)}
                      className={`p-2.5 rounded-xl border text-[10px] font-extrabold text-center transition-all cursor-pointer ${
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

              {/* 2. Slot picker */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider">
                    2. Select Time & Full Day Schedule
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
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center flex flex-col justify-center items-center transition-all cursor-pointer ${
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
                          {status === 'LUNCH' ? 'Lunch Hour' : status === 'SURGERY' ? 'Surgery' : 'Free Slot'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Patient Details Form */}
              {selectedDate && selectedSlot && (
                <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-card-custom">
                  <div>
                    <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-1.5">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.patientName}
                      onChange={e => {
                        setBookingForm({...bookingForm, patientName: e.target.value});
                        setDuplicateError('');
                      }}
                      placeholder="Enter full name"
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
                      placeholder="e.g. Fever, cough"
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                    />
                  </div>

                  {/* Duplicate Booking Warning block */}
                  {duplicateError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-[10px] font-bold flex items-start space-x-2">
                      <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                      <span>{duplicateError}</span>
                    </div>
                  )}

                  {/* Secure warning notice */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-semibold leading-relaxed">
                    * pay directly at reception Desk. Arogya Care App will not process payments.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Generate Slot Token & Book
                  </button>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* ACTIVE BOOKINGS MANAGER: Functional Delete/Cancel Section */}
        {appointments.length > 0 && bookingStep > 1 && (
          <div className="mt-14 max-w-4xl mx-auto border-t border-card-custom pt-8">
            <h3 className="text-lg font-black text-primary-custom mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Active Appointment Console (Slots Cancel Manager)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((app) => (
                <motion.div
                  key={app.id}
                  className="bg-card-surface border border-card-custom rounded-2xl p-4 flex justify-between items-start shadow-md relative overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-primary-custom">{app.doctorName}</h4>
                      <span className="text-[9px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold uppercase">
                        {app.specialty.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-secondary-custom leading-normal">
                      Patient: <span className="font-bold text-primary-custom">{app.patientName}</span> ({app.age} Yrs)
                    </p>
                    <p className="text-[10px] text-secondary-custom">
                      Slot: <span className="font-bold text-brand-from">{app.date}</span> at <span className="font-bold text-brand-from">{app.timeSlot}</span>
                    </p>
                    <div className="flex items-center space-x-3 pt-2 text-[10px]">
                      <span className="text-secondary-custom">Token Position: <span className="font-black text-primary-custom">#{app.tokenNumber}</span></span>
                      <span className="opacity-40">|</span>
                      <span className="text-secondary-custom">Consult: <span className="font-black text-emerald-500">{app.estArrivalTime}</span></span>
                    </div>
                  </div>

                  {/* Cancel Booking action */}
                  <button
                    onClick={() => handleCancelAppointment(app.id, app.doctorName)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                    title="Cancel Appointment Slot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AIDoctorBookingPage;
