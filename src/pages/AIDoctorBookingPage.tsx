import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Calendar, Clock, Phone, MessageSquare, MapPin, 
  User, CheckCircle, AlertTriangle, Coffee, ShieldAlert, Trash2, ShieldCheck, 
  Check, Star, Award, Briefcase, Heart, BookOpen, Compass, 
  Stethoscope, GraduationCap, Image, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

/* ─────────── Types ─────────── */
interface Appointment {
  id: string;
  doctorId: string;
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
  receptionPhone: string;
  assistantWhatsapp: string;
  personality: string;
  aboutDoctor: string;
  docPhoto: string;
  assistantName: string;
  assistantPhoto: string;
  services: string[];
  // Gallery: 12-15 photos per doctor (clinic, degree, checkup, etc.)
  gallery: { url: string; label: string }[];
}

/* ─────────── Doctor Database ─────────── */
const DOCTORS_DB: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Neha Sharma',
    specialty: 'Pediatrician (Child Specialist)',
    qualifications: 'MBBS, MD (Pediatrics) - AIIMS Delhi, DCH (Royal College, London)',
    experienceYears: 16,
    rating: 4.9,
    consultsCount: 2450,
    address: 'Arogya Child Care Clinic, Sector 15, Noida, Uttar Pradesh',
    mapLink: 'https://maps.google.com/?q=Sector+15+Noida',
    timing: '10:00 AM - 05:00 PM',
    slotsLeft: 4,
    lunchBreak: '01:00 PM - 02:00 PM',
    surgeryTime: '03:00 PM - 04:00 PM',
    emergencyAway: false,
    activeToken: 5,
    waitingPatients: 2,
    avgWaitMins: 15,
    phone: '+919876543201',
    whatsapp: '919876543201',
    receptionPhone: '+919876500001',
    assistantWhatsapp: '919876500002',
    personality: 'Warm, patient, child-friendly. Known for making children comfortable during checkups. Always explains procedures to parents in simple language.',
    aboutDoctor: 'Dr. Neha Sharma is a nationally acclaimed Pediatrician who completed her MBBS from AIIMS Delhi and earned her MD in Pediatrics as a gold medalist. She further specialized with a DCH diploma from the Royal College of Pediatrics, London. With over 16 years of hands-on clinical experience, she has successfully treated more than 2,400 children across immunization programs, neonatal intensive care, and developmental pediatric assessments. She actively publishes research on childhood nutrition deficiencies in rural India.',
    docPhoto: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=600&h=600&q=80',
    assistantName: 'Amit Kumar (Compounder)',
    assistantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
    services: ['Childhood Immunizations', 'Growth & Nutrition Assessment', 'Newborn Screening', 'Developmental Delay Therapy'],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Clinic Reception & Lobby' },
      { url: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS Degree Certificate' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Convocation & Degree Ceremony' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Patient Checkup in Progress' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Consultation Room Interior' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'OPD Waiting Area' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Hospital Building Exterior' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor Examining Child Patient' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Medical Equipment & Lab' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Nursing Station & ICU' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Pharmacy Counter' },
      { url: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=500&h=350&q=80', label: 'Dr. Neha During Rounds' },
    ]
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Iyer',
    specialty: 'Cardiologist (Heart Specialist)',
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology) - BHU Varanasi, FACC (USA)',
    experienceYears: 22,
    rating: 5.0,
    consultsCount: 4120,
    address: 'Arogya Heart Hospital, Salt Lake, Sector V, Kolkata, West Bengal',
    mapLink: 'https://maps.google.com/?q=Salt+Lake+Kolkata',
    timing: '02:00 PM - 07:00 PM',
    slotsLeft: 0,
    lunchBreak: 'None',
    surgeryTime: '04:00 PM - 06:30 PM',
    emergencyAway: true,
    activeToken: 0,
    waitingPatients: 0,
    avgWaitMins: 0,
    phone: '+919876543202',
    whatsapp: '919876543202',
    receptionPhone: '+919876500003',
    assistantWhatsapp: '919876500004',
    personality: 'Extremely analytical, composed under critical situations, and committed to cardiac rehabilitation. Talks to patients with clarity and reassurance.',
    aboutDoctor: 'Dr. Rajesh Iyer is one of the most distinguished Cardiologists in Eastern India, holding an MBBS and MD from BHU Varanasi, and a super-specialization DM in Cardiology. He is a Fellow of the American College of Cardiology (FACC). Over 22 years, he has performed more than 4,000 cardiac catheterizations and angioplasty procedures. He lectures at national cardiology conferences and has trained dozens of junior cardiologists across the country.',
    docPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&h=600&q=80',
    assistantName: 'Joy Dutta (Head Assistant)',
    assistantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    services: ['Angiography & Angioplasty', 'Echocardiography (2D Echo)', 'Hypertension & Cholesterol Management', 'Post-Bypass Rehabilitation'],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cardiac Surgery Theater' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS Degree & Fellowship' },
      { url: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=500&h=350&q=80', label: 'DM Cardiology Certificate' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'ECG & Monitoring Room' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Hospital Main Building' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor With Patient' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Reception & Help Desk' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cath Lab Equipment' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cardiac Checkup Room' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Intensive Care Unit' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Hospital Pharmacy' },
      { url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Dr. Rajesh at Conference' },
    ]
  },
  {
    id: 'doc-3',
    name: 'Dr. Amit Verma',
    specialty: 'General Physician (Family Doctor)',
    qualifications: 'MBBS, MD (General Medicine) - Kasturba Medical College, Manipal',
    experienceYears: 12,
    rating: 4.8,
    consultsCount: 3100,
    address: 'Arogya Family Clinic, Indiranagar 12th Main Road, Bengaluru, Karnataka',
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
    receptionPhone: '+919876500005',
    assistantWhatsapp: '919876500006',
    personality: 'Friendly, empathetic, excellent listener. Takes time to explain diagnoses in local languages. Very popular among elderly patients and families.',
    aboutDoctor: 'Dr. Amit Verma graduated with an MBBS from Kasturba Medical College, Manipal, one of the top medical institutions in India. He completed his MD in General Medicine and has been practicing for 12+ years. He specializes in chronic disease management, infectious disease treatment, and preventive health screening. He runs weekly free health camps in rural Bengaluru communities.',
    docPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&h=600&q=80',
    assistantName: 'Rahul Singh (Receptionist)',
    assistantPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
    services: ['Chronic Disease Management', 'Preventive Health Checkups', 'Infectious Disease Therapy', 'Diabetes & BP Control'],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'Family Clinic Interior' },
      { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&h=350&q=80', label: 'Medical Degree Documents' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Convocation Photo' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Consultation Desk' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Waiting Area & Front Desk' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor Examining Patient' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Blood Pressure Checkup' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Clinic Building View' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Lab & Diagnostics' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Emergency Care Setup' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Pharmacy & Medicines' },
      { url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&h=350&q=80', label: 'Dr. Amit Health Camp' },
    ]
  },
  {
    id: 'doc-4',
    name: 'Dr. Priya Patel',
    specialty: 'Dermatologist (Skin Specialist)',
    qualifications: 'MBBS, DDVL (Dermatology) - Grant Medical College, Mumbai',
    experienceYears: 14,
    rating: 4.9,
    consultsCount: 2890,
    address: 'Arogya Skin & Laser Center, Andheri West, Mumbai, Maharashtra',
    mapLink: 'https://maps.google.com/?q=Andheri+West+Mumbai',
    timing: '11:00 AM - 03:00 PM',
    slotsLeft: 6,
    lunchBreak: 'None',
    surgeryTime: '12:30 PM - 01:00 PM',
    emergencyAway: false,
    activeToken: 8,
    waitingPatients: 1,
    avgWaitMins: 12,
    phone: '+919876543204',
    whatsapp: '919876543204',
    receptionPhone: '+919876500007',
    assistantWhatsapp: '919876500008',
    personality: 'Professional, detail-oriented, empowers patients with skincare knowledge. Known for painless laser procedures and compassionate post-treatment follow-ups.',
    aboutDoctor: 'Dr. Priya Patel is a leading Dermatologist from Mumbai with an MBBS and DDVL from Grant Medical College. She has 14 years of experience in clinical dermatology, cosmetic procedures, and advanced laser-based scar management. She has authored articles in the Indian Journal of Dermatology and regularly conducts skin health awareness workshops. Her clinic is equipped with state-of-the-art laser technology.',
    docPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=600&q=80',
    assistantName: 'Sneha Shah (Clinical Associate)',
    assistantPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    services: ['Laser Acne Scar Treatment', 'Anti-Aging & Skin Rejuvenation', 'Clinical Dermatitis & Eczema', 'Hair Fall & PRP Therapy'],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Laser Treatment Room' },
      { url: 'https://images.unsplash.com/photo-1588600878108-57c6b1e4b4d1?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS Certificate Display' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Graduation Ceremony' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skin Consultation Room' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Center Exterior View' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Reception & Waiting Hall' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skin Examination Session' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Procedure Setup Area' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Advanced Laser Equipment' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Treatment Recovery Room' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skincare Products Counter' },
      { url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&h=350&q=80', label: 'Dr. Priya Consulting' },
    ]
  }
];

/* ─────────── Framer Motion Variants ─────────── */
const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98, rotateX: 2 },
  animate: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, scale: 0.98, rotateX: -2, transition: { duration: 0.3 } }
};

const cardHover3D = {
  scale: 1.03,
  rotateX: 3,
  rotateY: -3,
  boxShadow: '0 25px 50px rgba(124, 58, 237, 0.15), 0 0 30px rgba(124, 58, 237, 0.08)'
};

/* ─────────── Component ─────────── */
const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // STEPS: 1=Warning, 2=DoctorList, 3=AboutDoctor, 4=AboutClinic, 5=BookAppointment, 6=Success
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingForm, setBookingForm] = useState({ patientName: '', age: '', symptoms: '', phone: '' });
  const [duplicateError, setDuplicateError] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lastBooked, setLastBooked] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS_DB);

  useEffect(() => {
    const saved = localStorage.getItem('arogya_doctor_appointments');
    if (saved) setAppointments(JSON.parse(saved));
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  /* ── Booking Logic ── */
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError('');
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    const targetName = bookingForm.patientName.trim().toLowerCase();
    if (appointments.some(a => a.patientName.trim().toLowerCase() === targetName)) {
      setDuplicateError('Duplicate Booking Detected: An active slot is already reserved for this patient name. Please cancel your existing appointment first.');
      return;
    }

    const token = selectedDoctor.activeToken + selectedDoctor.waitingPatients + 1;
    const estWait = (selectedDoctor.waitingPatients + 1) * selectedDoctor.avgWaitMins;
    const arrival = new Date(); arrival.setMinutes(arrival.getMinutes() + estWait);
    const estArrivalTime = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newApp: Appointment = {
      id: 'app-' + Date.now(), doctorId: selectedDoctor.id, doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty, patientName: bookingForm.patientName.trim(),
      age: bookingForm.age, symptoms: bookingForm.symptoms, phone: bookingForm.phone,
      timeSlot: selectedSlot, tokenNumber: token, estArrivalTime, date: selectedDate
    };

    const updated = [newApp, ...appointments];
    setAppointments(updated);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(updated));
    setDoctors(prev => prev.map(d => d.id === selectedDoctor.id ? { ...d, slotsLeft: Math.max(0, d.slotsLeft - 1), waitingPatients: d.waitingPatients + 1 } : d));
    setLastBooked(newApp);
    setStep(6);
  };

  const handleCancel = (appId: string, docName: string) => {
    if (!window.confirm('Cancel this appointment? The slot will be released.')) return;
    const filtered = appointments.filter(a => a.id !== appId);
    setAppointments(filtered);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(filtered));
    setDoctors(prev => prev.map(d => d.name === docName ? { ...d, slotsLeft: Math.min(8, d.slotsLeft + 1), waitingPatients: Math.max(0, d.waitingPatients - 1) } : d));
  };

  const handleWhatsApp = (waNumber: string, msg: string) => {
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getUpcomingDates = () => {
    const dates = [];
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); dates.push({ raw: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-IN', opts) }); }
    return dates;
  };

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const slotStatus = (doc: Doctor, slot: string) => {
    if (doc.lunchBreak !== 'None') { const [s, e] = doc.lunchBreak.split(' - '); if (slot >= s && slot <= e) return 'LUNCH'; }
    if (doc.surgeryTime !== 'None') { const m = doc.surgeryTime.match(/\d{2}:\d{2}\s*(?:AM|PM)/g); if (m && m.length >= 2 && slot >= m[0] && slot <= m[1]) return 'SURGERY'; }
    return 'FREE';
  };

  const goBack = () => {
    if (step === 1) navigate('/dashboard');
    else if (step === 2) setStep(1);
    else if (step >= 3 && step <= 5) setStep(2);
    else if (step === 6) setStep(2);
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Top navigation bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.button 
              onClick={goBack}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className="mr-4 p-2.5 rounded-full bg-card-surface shadow-lg border border-card-custom cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-secondary-custom" />
            </motion.button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary-custom">
                AI Doctor Booking
              </h1>
              <p className="text-secondary-custom text-xs mt-0.5">Powered by Arogya Care</p>
            </div>
          </div>
          <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest font-black hidden sm:inline">
            Development Preview
          </span>
        </div>

        {/* ═══════════════ WIZARD STEPS ═══════════════ */}
        <AnimatePresence mode="wait">

          {/* ═══ STEP 1: FULL-SCREEN WARNING — NOTHING ELSE ═══ */}
          {step === 1 && (
            <motion.div key="s1" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center justify-center py-16"
              style={{ perspective: 1200 }}
            >
              <motion.div 
                className="w-full max-w-lg bg-card-surface border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden relative"
                whileHover={{ rotateX: 1, rotateY: -1 }}
              >
                {/* Top Red strip */}
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />

                <div className="p-8 md:p-10">
                  {/* Pulsing 3D Logo */}
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div className="absolute inset-0 bg-red-500 rounded-2xl rotate-6 opacity-20" animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 bg-red-500 rounded-2xl -rotate-6 opacity-20" animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl shadow-red-600/30">
                      <ShieldAlert className="h-12 w-12 text-white" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-primary-custom text-center tracking-tight uppercase mb-2">
                    Warning
                  </h2>
                  <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-black text-center mb-8">
                    Development Mode &bull; Sandbox Preview
                  </p>

                  <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 text-[13px] text-secondary-custom leading-relaxed space-y-3 mb-8">
                    <p>
                      This patient scheduling module is a <strong className="text-primary-custom">simulated development preview</strong>. All doctor listings, time-slot allocations, surgery schedules, and live token queues use mock data for interface demonstration only.
                    </p>
                    <p className="text-red-400 font-semibold">
                      Future production releases will synchronize real-time hospital APIs. No monetary payment is processed inside this application.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3.5 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Acknowledge & Proceed <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ STEP 2: DOCTOR DIRECTORY — Name + Photo + Specialty ONLY ═══ */}
          {step === 2 && (
            <motion.div key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <h2 className="text-xl font-black text-primary-custom">Select a Specialist</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {doctors.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                    whileHover={cardHover3D}
                    style={{ perspective: 1000 }}
                    className="bg-card-surface border border-card-custom rounded-3xl p-5 shadow-lg cursor-pointer relative overflow-hidden"
                  >
                    {/* Doctor Core Info — ONLY photo, name, specialty */}
                    <div className="flex items-center space-x-4 mb-5">
                      <img src={doc.docPhoto} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/20 shadow-md" />
                      <div>
                        <h3 className="font-black text-primary-custom text-base flex items-center gap-2">
                          {doc.name}
                          {doc.emergencyAway && <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Unavailable</span>}
                        </h3>
                        <p className="text-[11px] text-brand-from font-extrabold uppercase tracking-wide">{doc.specialty}</p>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-3 gap-2 border-t border-card-custom pt-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-purple-500/10 hover:border-purple-500/30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold text-secondary-custom flex flex-col items-center gap-1 cursor-pointer transition-all"
                      >
                        <User className="h-4 w-4 text-purple-500" /> About Doctor
                      </motion.button>

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedDoctor(doc); setStep(4); }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-blue-500/10 hover:border-blue-500/30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold text-secondary-custom flex flex-col items-center gap-1 cursor-pointer transition-all"
                      >
                        <Image className="h-4 w-4 text-blue-500" /> Clinic & Degrees
                      </motion.button>

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        disabled={doc.emergencyAway}
                        onClick={() => { setSelectedDoctor(doc); setSelectedSlot(''); setBookingForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDuplicateError(''); setStep(5); }}
                        className="py-2.5 bg-brand-gradient text-white disabled:opacity-30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold flex flex-col items-center gap-1 cursor-pointer shadow-md"
                      >
                        <Calendar className="h-4 w-4" /> Book Slot
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Active Bookings Console (only shows when on doctor list) */}
              {appointments.length > 0 && (
                <div className="border-t border-card-custom pt-8 mt-8">
                  <h3 className="text-base font-black text-primary-custom mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> My Active Appointments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {appointments.map(app => (
                      <motion.div key={app.id} whileHover={{ scale: 1.01 }}
                        className="bg-card-surface border border-card-custom rounded-2xl p-4 flex justify-between items-start shadow-sm"
                      >
                        <div className="space-y-1 text-xs">
                          <h4 className="font-extrabold text-primary-custom">{app.doctorName}</h4>
                          <p className="text-secondary-custom">Patient: <strong>{app.patientName}</strong> ({app.age} yrs)</p>
                          <p className="text-brand-from font-bold">{app.date} at {app.timeSlot} &bull; Token #{app.tokenNumber}</p>
                        </div>
                        <button onClick={() => handleCancel(app.id, app.doctorName)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl cursor-pointer" title="Cancel">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 3: ABOUT DOCTOR — Full Bio, Big Photo, Qualifications, Personality ═══ */}
          {step === 3 && selectedDoctor && (
            <motion.div key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="max-w-2xl mx-auto space-y-6" style={{ perspective: 1200 }}
            >
              {/* Large Doctor Portrait */}
              <motion.div whileHover={{ rotateY: -2, rotateX: 1 }} className="relative rounded-3xl overflow-hidden shadow-2xl border border-card-custom">
                <img src={selectedDoctor.docPhoto} alt={selectedDoctor.name} className="w-full h-72 md:h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center text-xs text-amber-400 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-lg">
                      <Star className="h-3.5 w-3.5 fill-amber-400 mr-0.5" /> {selectedDoctor.rating}
                    </span>
                    <span className="text-[10px] text-white/60 font-semibold">{selectedDoctor.consultsCount}+ consultations</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                  <p className="text-sm text-purple-300 font-extrabold uppercase tracking-wider">{selectedDoctor.specialty}</p>
                </div>
              </motion.div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <GraduationCap className="h-5 w-5 text-purple-500" />, label: 'Degree', value: selectedDoctor.qualifications.split(',')[0] },
                  { icon: <Briefcase className="h-5 w-5 text-brand-from" />, label: 'Experience', value: `${selectedDoctor.experienceYears}+ Years` },
                  { icon: <Heart className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />, label: 'Consultations', value: `${selectedDoctor.consultsCount}+` },
                ].map((stat, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05, rotateX: 3 }}
                    className="bg-card-surface border border-card-custom p-4 rounded-2xl text-center shadow-md"
                  >
                    <div className="flex justify-center mb-2">{stat.icon}</div>
                    <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">{stat.label}</span>
                    <span className="text-xs font-black text-primary-custom mt-0.5 block">{stat.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* Full Qualifications */}
              <div className="bg-card-surface border border-card-custom rounded-2xl p-5 shadow-md space-y-4">
                <div>
                  <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">Full Education & Credentials</span>
                  <p className="text-xs text-primary-custom font-bold leading-relaxed">{selectedDoctor.qualifications}</p>
                </div>
                <div className="border-t border-card-custom pt-3">
                  <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">About {selectedDoctor.name}</span>
                  <p className="text-xs text-secondary-custom leading-relaxed">{selectedDoctor.aboutDoctor}</p>
                </div>
                <div className="border-t border-card-custom pt-3">
                  <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">Doctor Nature & Patient Reviews</span>
                  <p className="text-xs text-secondary-custom italic leading-relaxed">"{selectedDoctor.personality}"</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-2">Primary Medical Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.services.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-xl">{s}</span>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4 border-t border-card-custom">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={selectedDoctor.emergencyAway}
                  onClick={() => { setSelectedSlot(''); setBookingForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDuplicateError(''); setStep(5); }}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  Book Appointment <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4: ABOUT CLINIC — 12 Photos Gallery + Location ═══ */}
          {step === 4 && selectedDoctor && (
            <motion.div key="s4" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="max-w-2xl mx-auto space-y-6" style={{ perspective: 1200 }}
            >
              <h2 className="text-xl font-black text-primary-custom">
                Clinic & Credential Verification
                <span className="block text-xs text-secondary-custom font-semibold mt-0.5 normal-case">{selectedDoctor.name} — {selectedDoctor.specialty}</span>
              </h2>

              {/* Photo Gallery Grid (12 photos) */}
              <div className="grid grid-cols-3 gap-3">
                {selectedDoctor.gallery.map((img, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                    whileHover={{ scale: 1.06, rotateX: 3, rotateY: -3, zIndex: 10 }}
                    className="relative rounded-2xl overflow-hidden border border-card-custom shadow-md h-28 md:h-36 cursor-pointer group"
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[9px] text-white font-bold">{img.label}</span>
                    </div>
                    <span className="absolute top-1.5 left-1.5 text-[7px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">{i + 1}/{selectedDoctor.gallery.length}</span>
                  </motion.div>
                ))}
              </div>

              {/* Compounder/Assistant Info */}
              <div className="bg-card-surface border border-card-custom rounded-2xl p-4 flex items-center space-x-4 shadow-md">
                <img src={selectedDoctor.assistantPhoto} alt={selectedDoctor.assistantName} className="w-12 h-12 rounded-full object-cover border border-card-custom" />
                <div>
                  <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">Assigned Coordinator</span>
                  <span className="text-xs font-black text-primary-custom">{selectedDoctor.assistantName}</span>
                </div>
              </div>

              {/* Location Card */}
              <motion.div whileHover={{ rotateX: 1, rotateY: -1 }}
                className="bg-card-surface border border-card-custom rounded-2xl p-5 shadow-md space-y-3"
              >
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider">Clinic Address & Map</span>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary-custom font-semibold leading-relaxed">{selectedDoctor.address}</p>
                </div>
                <a href={selectedDoctor.mapLink} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[10px] uppercase text-center"
                >
                  Open in Google Maps
                </a>
              </motion.div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4 border-t border-card-custom">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={selectedDoctor.emergencyAway}
                  onClick={() => { setSelectedSlot(''); setBookingForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDuplicateError(''); setStep(5); }}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  Book Appointment <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 5: BOOK APPOINTMENT — Calendar + Slots + Form ═══ */}
          {step === 5 && selectedDoctor && (
            <motion.div key="s5" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-card-custom pb-4">
                <div>
                  <span className="text-[9px] text-brand-from font-extrabold uppercase tracking-wider">Booking For</span>
                  <h3 className="font-extrabold text-lg text-primary-custom">{selectedDoctor.name}</h3>
                  <p className="text-[10px] text-secondary-custom">{selectedDoctor.specialty}</p>
                </div>
                <div className="text-right text-[10px] text-secondary-custom">
                  <span className="block font-extrabold uppercase tracking-wider">Working Hours</span>
                  <span className="font-bold text-primary-custom">{selectedDoctor.timing}</span>
                </div>
              </div>

              {/* No Payment Notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  Arogya Care does not collect any payment. After booking, pay directly at the clinic reception desk or via links shared by the assistant on WhatsApp.
                </p>
              </div>

              {/* 1. Date Calendar */}
              <div>
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">1. Choose Date</label>
                <div className="grid grid-cols-4 gap-2">
                  {getUpcomingDates().map(d => (
                    <motion.button key={d.raw} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(d.raw)}
                      className={`p-2.5 rounded-xl border text-[10px] font-extrabold text-center cursor-pointer transition-all ${
                        selectedDate === d.raw ? 'bg-brand-gradient text-white border-transparent shadow-md' : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                      }`}
                    >{d.label}</motion.button>
                  ))}
                </div>
              </div>

              {/* 2. Slot Picker */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider">2. Select Time Slot</label>
                  <span className="text-[9px] text-emerald-500 font-extrabold uppercase">{selectedDoctor.slotsLeft} slots left</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(slot => {
                    const st = slotStatus(selectedDoctor, slot);
                    return (
                      <motion.button key={slot} whileHover={st === 'FREE' ? { scale: 1.05 } : {}} whileTap={st === 'FREE' ? { scale: 0.95 } : {}}
                        disabled={st !== 'FREE'} onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl border text-[10px] font-bold text-center flex flex-col items-center cursor-pointer transition-all ${
                          st === 'LUNCH' ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 opacity-50 cursor-not-allowed'
                          : st === 'SURGERY' ? 'bg-red-500/10 border-red-500/25 text-red-500 opacity-50 cursor-not-allowed'
                          : selectedSlot === slot ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md'
                          : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                        }`}
                      >
                        <span>{slot}</span>
                        <span className="text-[7px] mt-0.5 opacity-60">{st === 'LUNCH' ? 'Lunch' : st === 'SURGERY' ? 'Surgery' : 'Free'}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Patient Form */}
              {selectedDate && selectedSlot && (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-card-custom"
                >
                  <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider">3. Patient Details</label>

                  <input type="text" required placeholder="Patient Full Name" value={bookingForm.patientName}
                    onChange={e => { setBookingForm({...bookingForm, patientName: e.target.value}); setDuplicateError(''); }}
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />

                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" required placeholder="Age" value={bookingForm.age}
                      onChange={e => setBookingForm({...bookingForm, age: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                    <input type="tel" required placeholder="Phone Number" value={bookingForm.phone}
                      onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                  </div>

                  <input type="text" required placeholder="Describe Symptoms" value={bookingForm.symptoms}
                    onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />

                  {duplicateError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-[10px] font-bold flex items-start space-x-2">
                      <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                      <span>{duplicateError}</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                    >Back to List</motion.button>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                    >Confirm Booking</motion.button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 6: SUCCESS + WhatsApp Redirect Contacts ═══ */}
          {step === 6 && lastBooked && selectedDoctor && (
            <motion.div key="s6" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="max-w-md mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-2xl text-center space-y-6"
            >
              <motion.div animate={{ scale: [0.8, 1.2, 1] }} transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/30"
              >
                <CheckCircle className="h-8 w-8" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-black text-primary-custom">🎉 Booking Confirmed!</h3>
                <p className="text-xs text-secondary-custom mt-1">Your slot token has been reserved via Arogya Care.</p>
              </div>

              {/* Booking Summary */}
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom rounded-2xl p-4 text-left space-y-2 text-xs font-semibold">
                <div className="flex justify-between"><span className="text-secondary-custom">Specialist:</span><span className="text-primary-custom">{lastBooked.doctorName}</span></div>
                <div className="flex justify-between"><span className="text-secondary-custom">Date & Time:</span><span className="text-primary-custom">{lastBooked.date} at {lastBooked.timeSlot}</span></div>
                <div className="flex justify-between border-t border-card-custom pt-2 mt-2"><span className="text-secondary-custom">Queue Token:</span><span className="text-brand-from font-black text-sm">#{lastBooked.tokenNumber}</span></div>
                <div className="flex justify-between"><span className="text-secondary-custom">Est. Consult Arrival:</span><span className="text-emerald-500 font-black text-sm">{lastBooked.estArrivalTime}</span></div>
              </div>

              {/* WhatsApp Contact Redirects */}
              <div className="space-y-2">
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider">Contact via WhatsApp to confirm</span>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleWhatsApp(selectedDoctor.whatsapp, `Hi! I would like to book a slot for ${lastBooked.patientName}, Age: ${lastBooked.age}, Symptoms: ${lastBooked.symptoms} on ${lastBooked.date} at ${lastBooked.timeSlot} under ${lastBooked.doctorName}. I found your clinic on the Arogya Care App. Please confirm my appointment.`)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" /> WhatsApp Doctor ({selectedDoctor.name.split(' ').pop()})
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleWhatsApp(selectedDoctor.assistantWhatsapp, `Hi, I just booked a slot for ${lastBooked.patientName} on ${lastBooked.date} at ${lastBooked.timeSlot} with ${lastBooked.doctorName} via the Arogya Care App. Token #${lastBooked.tokenNumber}. Please confirm availability.`)}
                  className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Assistant ({selectedDoctor.assistantName.split(' ')[0]})
                </motion.button>

                <a href={`tel:${selectedDoctor.receptionPhone}`}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Reception Desk
                </a>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer mt-4"
              >
                Done — Back to Doctor List
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>

      </main>
    </div>
  );
};

export default AIDoctorBookingPage;
