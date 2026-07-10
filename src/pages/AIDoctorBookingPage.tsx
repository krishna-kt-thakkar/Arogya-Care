import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Phone, MessageSquare, MapPin, 
  User, CheckCircle, AlertTriangle, Coffee, ShieldAlert, X, 
  ChevronRight, Star, Award, Briefcase, Heart, Trash2, ShieldCheck, Check
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
  // Visual assets
  docPhoto: string;
  assistantName: string;
  assistantPhoto: string;
  clinicPhoto: string;
  degreePhoto: string; // Photo of degree/certificate
  examPhoto: string; // Photo of doctor examining patient
  services: string[];
}

const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Step Management: 1 = Disclaimer, 2 = Doctor Selection, 3 = Calendar & Slots, 4 = Form, 5 = Congratulations
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

  // Doctors Database with credentials and services
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
      personality: 'Gentle, warm, and highly skilled in handling pediatric immunizations and childhood developmental therapies.',
      docPhoto: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Amit Kumar (Compounder)',
      assistantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Childhood Immunizations', 'Growth & Nutrition Assessment', 'Newborn Screening']
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
      emergencyAway: true, // Emergency surgery status
      activeToken: 0,
      waitingPatients: 0,
      avgWaitMins: 0,
      phone: '+919876543202',
      whatsapp: '919876543202',
      personality: 'Extremely focused, patient, and globally recognized for cardiology diagnostics and angiography management.',
      docPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Joy Dutta (Head Assistant)',
      assistantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Angiography & Angioplasty', 'Echocardiography (ECG)', 'Hypertension Management']
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
      personality: 'Friendly, empathetic, and detail-oriented in diagnosing viral fevers, diabetes, and basic healthcare routines.',
      docPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
      assistantName: 'Rahul Singh (Receptionist)',
      assistantPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
      clinicPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=400&q=80',
      degreePhoto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=300&q=80',
      examPhoto: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&h=400&q=80',
      services: ['Chronic Disease Management', 'Diagnostic Preventive Health checkups', 'Infectious Diseases Therapy']
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
      services: ['Laser Acne Scar Treatment', 'Anti-Aging Therapy', 'Clinical Dermatitis & Eczema care']
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

    // Duplicate check validation
    const targetName = bookingForm.patientName.trim().toLowerCase();
    const hasDuplicate = appointments.some(
      app => app.patientName.trim().toLowerCase() === targetName
    );

    if (hasDuplicate) {
      setDuplicateError('Duplicate Booking Detected: An active slot is already reserved for this patient name. Please cancel your existing appointment or use a different patient name.');
      return;
    }

    // Token and queue estimation
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

    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(updatedAppointments));

    // Decrement slots left and update queue waiting count
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
    setBookingStep(5); // Shift to congratulations step
  };

  const handleWhatsAppRedirect = () => {
    if (!lastBookedAppointment || !selectedDoctor) return;

    const formattedMessage = `Hi! I would like to book a slot for ${lastBookedAppointment.patientName}, Age: ${lastBookedAppointment.age}, Symptoms: ${lastBookedAppointment.symptoms} on ${lastBookedAppointment.date} at ${lastBookedAppointment.timeSlot} under ${lastBookedAppointment.doctorName}. I found your clinic on the Arogya Care App. Please confirm my appointment.`;
    
    const url = `https://wa.me/${selectedDoctor.whatsapp}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, '_blank');
    setShowSuccessModal(false);
  };

  const handleCancelAppointment = (appId: string, doctorName: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;

    // Filter appointments
    const filtered = appointments.filter(app => app.id !== appId);
    setAppointments(filtered);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(filtered));

    // Release slots count for the doctor
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

  // Generate 7 upcoming dates
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

  const handleDisclaimerAcknowledge = () => {
    setShowWarningModal(false);
    setBookingStep(2); // Go to specialist cards selection step
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
                if (bookingStep > 2) {
                  setBookingStep(prev => prev - 1);
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
                Interactive clinic token scheduling, custom credentials, visual certificates verification, and WhatsApp redirects.
              </p>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
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

        {/* Wizard Main Steps Render */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Full-Screen Warning & Legal Disclaimer notice */}
          {bookingStep === 1 && (
            <motion.div 
              key="step-disclaimer"
              className="max-w-2xl mx-auto bg-card-surface border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-red-500" />
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/25 shadow-lg shadow-red-500/10">
                <ShieldAlert className="h-10 w-10 animate-pulse" />
              </div>

              <h2 className="text-3xl font-black text-primary-custom text-center tracking-tight mb-2 uppercase">
                Development Preview Notice
              </h2>
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-black text-center mb-8">
                Arogya Care Clinical Sandbox
              </p>

              <div className="space-y-4 text-xs leading-relaxed text-secondary-custom max-h-[300px] overflow-y-auto pr-2 border-y border-card-custom py-6 my-6">
                <div className="p-4 bg-red-500/[0.02] border border-red-500/10 rounded-2xl">
                  <p className="font-bold text-primary-custom mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-red-500" /> Sandbox Policy & Data Notice:
                  </p>
                  <p className="mt-1">
                    This module is a simulated development preview for showcasing clinic queues, patient registration, and slot allocations. All doctors listing metadata, time slot options, surgery timetables, and active token counters are mock data. 
                  </p>
                  <p className="mt-2 font-bold text-red-400">
                    Production sync will integrate clinic APIs to enable live database writes. No cash transaction is processed inside the app.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDisclaimerAcknowledge}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/15 cursor-pointer"
              >
                Acknowledge & Start Booking
              </button>
            </motion.div>
          )}

          {/* STEP 2: Doctor Selection Grid with full qualifications & verify photos */}
          {bookingStep === 2 && (
            <motion.div
              key="step-doctors"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-primary-custom">Choose a Specialist Doctor</h2>
                <span className="text-xs text-secondary-custom font-semibold">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {doctors.map((doc) => (
                  <motion.div
                    key={doc.id}
                    className={`bg-card-surface border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between relative ${
                      doc.emergencyAway ? 'border-red-500/40' : 'border-card-custom'
                    }`}
                    style={{ perspective: 1000 }}
                    whileHover={!doc.emergencyAway ? {
                      scale: 1.01,
                      rotateX: 1.5,
                      rotateY: -1.5,
                      boxShadow: '0 20px 40px rgba(124, 58, 237, 0.15)'
                    } : {}}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    {/* Facility Header Image */}
                    <div className="h-48 w-full overflow-hidden relative">
                      <img src={doc.clinicPhoto} alt="Clinic Lobby" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[8px] bg-brand-gradient text-white px-2 py-0.5 rounded font-black uppercase tracking-wider w-max mb-1">
                          Clinic Interior View
                        </span>
                        <h4 className="text-white font-extrabold text-xs flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                          {doc.address}
                        </h4>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Doctor portrait & header info */}
                      <div className="flex items-start space-x-4">
                        <img src={doc.docPhoto} alt={doc.name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/25 flex-shrink-0" />
                        <div>
                          <h3 className="font-extrabold text-primary-custom text-base flex items-center gap-1.5">
                            {doc.name}
                            <span className="inline-flex items-center text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                              <Star className="h-3 w-3 fill-amber-500 mr-0.5" /> {doc.rating}
                            </span>
                          </h3>
                          <p className="text-[10px] text-brand-from font-extrabold uppercase tracking-wide">{doc.specialty}</p>
                          <span className="text-[10px] text-secondary-custom font-semibold flex items-center mt-1">
                            <Award className="h-3.5 w-3.5 text-purple-500 mr-1 flex-shrink-0" />
                            {doc.qualifications}
                          </span>
                        </div>
                      </div>

                      {/* Professional Bio */}
                      <div className="text-xs text-secondary-custom flex items-center space-x-3 bg-white/5 border border-card-custom p-2.5 rounded-xl">
                        <div className="flex items-center text-purple-500">
                          <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="font-extrabold">{doc.experienceYears}+ Yrs Exp</span>
                        </div>
                        <span className="opacity-45">|</span>
                        <div className="flex items-center text-emerald-500">
                          <Heart className="h-4 w-4 mr-1 flex-shrink-0 fill-emerald-500/25" />
                          <span className="font-extrabold">{doc.consultsCount}+ Consultations</span>
                        </div>
                      </div>

                      {/* Doctor Character/Nature */}
                      <div className="text-xs text-secondary-custom leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-card-custom">
                        <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">Doctor Nature & Reviews</span>
                        <p className="italic">"{doc.personality}"</p>
                      </div>

                      {/* Verifications section (Certificate degree + Examine photo) */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom cursor-pointer">
                          <img src={doc.degreePhoto} className="w-full h-full object-cover" alt="MBBS Degree" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[8px] text-white font-extrabold uppercase tracking-widest">Verify Degree</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 text-[8px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">MBBS Diploma</span>
                        </div>
                        <div className="relative group rounded-xl overflow-hidden h-24 border border-card-custom cursor-pointer">
                          <img src={doc.examPhoto} className="w-full h-full object-cover" alt="Patient checkup" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[8px] text-white font-extrabold uppercase tracking-widest">Checkup Room</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 text-[8px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">Exam Ward</span>
                        </div>
                      </div>

                      {/* Dynamic emergency away warnings */}
                      {doc.emergencyAway && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-3 flex items-start space-x-2 text-[10px] font-bold">
                          <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 animate-pulse" />
                          <span>{t('emergencyAway')}</span>
                        </div>
                      )}

                      {/* Select/Actions */}
                      <div className="pt-4">
                        {doc.emergencyAway ? (
                          <a 
                            href={`tel:${doc.phone}`}
                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl text-xs uppercase text-center flex items-center justify-center gap-1.5"
                          >
                            <Phone className="h-4 w-4" /> Call Head Assistant
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setBookingStep(3); // Shift to calendar slots step
                            }}
                            className="w-full py-2.5 bg-brand-gradient text-white font-extrabold rounded-xl text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Select Doctor & Date
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Date & Slots Timeline selector */}
          {bookingStep === 3 && selectedDoctor && (
            <motion.div
              key="step-slots"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-brand-from font-extrabold uppercase tracking-wide">Doctor Selected</span>
                  <h3 className="font-extrabold text-lg text-primary-custom">{selectedDoctor.name}</h3>
                </div>
                <span className="text-xs text-secondary-custom font-semibold">Step 2 of 3</span>
              </div>

              {/* Date selection grid */}
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

              {/* Slot scheduler timeline */}
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

              <div className="pt-4 border-t border-card-custom flex gap-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Change Doctor
                </button>
                <button
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setBookingStep(4)}
                  className="flex-1 py-3 bg-brand-gradient disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Enter Patient Info
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Patient Info Form & Duplicates Validations */}
          {bookingStep === 4 && selectedDoctor && (
            <motion.div
              key="step-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-card-custom pb-4">
                <div>
                  <span className="text-[8px] text-purple-500 font-extrabold uppercase tracking-wide">Step 3 of 3</span>
                  <h3 className="text-lg font-extrabold text-primary-custom">Patient Information Console</h3>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-secondary-custom uppercase">Doctor & Slot</span>
                  <span className="text-xs font-black text-brand-from">{selectedDoctor.name} at {selectedSlot}</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
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
                    placeholder="Enter full name (must be unique)"
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
                      placeholder="e.g. 25"
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
                    Brief Symptoms
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.symptoms}
                    onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}
                    placeholder="e.g. Cough, high fever"
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                  />
                </div>

                {/* Duplicate booking error banner */}
                {duplicateError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-[10px] font-bold flex items-start space-x-2 animate-shake">
                    <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span>{duplicateError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-card-custom flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Change Slot
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: Congratulations success page with WhatsApp confirm redirect buttons */}
          {bookingStep === 5 && lastBookedAppointment && selectedDoctor && (
            <motion.div
              key="step-congrats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/35">
                <Check className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-primary-custom tracking-tight">🎉 Congratulations!</h3>
                <p className="text-xs text-secondary-custom mt-1">
                  Your appointment slot has been registered.
                </p>
              </div>

              <div className="bg-black/10 dark:bg-white/5 border border-card-custom rounded-2xl p-4 text-left space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Specialist:</span>
                  <span className="text-primary-custom font-bold">{lastBookedAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Reserved slot:</span>
                  <span className="text-primary-custom font-bold">{lastBookedAppointment.date} at {lastBookedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-card-custom pt-2 mt-2">
                  <span className="text-secondary-custom">Queue Token:</span>
                  <span className="text-brand-from font-black text-sm">#{lastBookedAppointment.tokenNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-custom">Consult Arrival:</span>
                  <span className="text-emerald-500 font-black text-sm">{lastBookedAppointment.estArrivalTime}</span>
                </div>
              </div>

              {/* Direct redirect confirmations buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 cursor-pointer"
                >
                  <MessageSquare className="h-4.5 w-4.5" /> Confirm Appointment on WhatsApp
                </button>
                <button
                  onClick={() => setBookingStep(2)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Finish & Back to Doctor List
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ACTIVE BOOKINGS MANAGER: Functional Delete/Cancel Section */}
        {appointments.length > 0 && (
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
