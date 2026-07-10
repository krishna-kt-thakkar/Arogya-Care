import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Calendar, Clock, Phone, MessageSquare, MapPin, 
  User, CheckCircle, AlertTriangle, ShieldAlert, Trash2, ShieldCheck, 
  Check, Star, Award, Briefcase, Heart, Image, 
  Stethoscope, GraduationCap, Users, Activity, Zap, ThumbsUp, Globe, BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

/* ═══════════ Types ═══════════ */
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

interface PatientReview {
  name: string;
  rating: number;
  comment: string;
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
  languages: string[];
  consultFee: string;
  services: string[];
  reviews: PatientReview[];
  gallery: { url: string; label: string }[];
}

/* ═══════════ Doctors Master Data ═══════════ */
const DOCTORS_DB: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Neha Sharma',
    specialty: 'Pediatrician (Child Specialist)',
    qualifications: 'MBBS, MD (Pediatrics) — AIIMS Delhi, DCH (Royal College, London)',
    experienceYears: 16,
    rating: 4.9,
    consultsCount: 2450,
    address: 'Arogya Child Care Clinic, Sector 15, Noida, Uttar Pradesh — 201301',
    mapLink: 'https://maps.google.com/?q=Sector+15+Noida',
    timing: '10:00 AM — 05:00 PM',
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
    aboutDoctor: 'Dr. Neha Sharma is a nationally acclaimed Pediatrician who completed her MBBS from AIIMS Delhi and earned her MD in Pediatrics as a gold medalist. She further specialized with a DCH diploma from the Royal College of Pediatrics, London. With over 16 years of hands-on clinical experience, she has successfully treated more than 2,400 children across immunization programs, neonatal intensive care, and developmental pediatric assessments.',
    docPhoto: '/doctors/dr_neha.png',
    assistantName: 'Amit Kumar (Compounder)',
    assistantPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
    languages: ['Hindi', 'English', 'Punjabi'],
    consultFee: '₹500 — ₹800',
    services: ['Childhood Immunizations', 'Growth & Nutrition Assessment', 'Newborn Screening', 'Developmental Delay Therapy'],
    reviews: [
      { name: 'Priya M.', rating: 5, comment: 'Dr. Neha was extremely gentle with my 2-year-old. Best pediatrician in Noida!', date: '12 Jun 2026' },
      { name: 'Rahul K.', rating: 5, comment: 'Very thorough diagnosis. She explained every detail about the vaccination schedule.', date: '08 Jun 2026' },
      { name: 'Ananya S.', rating: 4, comment: 'Good experience overall. Slight wait but the consultation was worth it.', date: '01 Jun 2026' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Clinic Reception & Lobby' },
      { url: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS Degree Certificate' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Degree Convocation Ceremony' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Patient Checkup in Progress' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Consultation Room Interior' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'OPD Waiting Area' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Hospital Building Exterior' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor Examining Child' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Medical Lab & Equipment' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Nursing Station & ICU Wing' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Pharmacy Counter' },
      { url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=500&h=350&q=80', label: 'Pediatric Play Area' },
    ]
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Iyer',
    specialty: 'Cardiologist (Heart Specialist)',
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology) — BHU Varanasi, FACC (USA)',
    experienceYears: 22,
    rating: 5.0,
    consultsCount: 4120,
    address: 'Arogya Heart Hospital, Salt Lake City, Sector V, Kolkata — 700091',
    mapLink: 'https://maps.google.com/?q=Salt+Lake+Kolkata',
    timing: '02:00 PM — 07:00 PM',
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
    personality: 'Extremely analytical, composed under critical situations, committed to cardiac rehabilitation. Talks to patients with clarity and confidence.',
    aboutDoctor: 'Dr. Rajesh Iyer is one of the most distinguished Cardiologists in Eastern India. He holds an MBBS and MD from BHU Varanasi, with a super-specialization DM in Cardiology. He is a Fellow of the American College of Cardiology (FACC). Over 22 years, he has performed more than 4,000 cardiac catheterizations and complex angioplasty procedures. He actively trains junior cardiologists at national conferences.',
    docPhoto: '/doctors/dr_rajesh.png',
    assistantName: 'Joy Dutta (Head Assistant)',
    assistantPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    languages: ['Hindi', 'English', 'Bengali'],
    consultFee: '₹1,200 — ₹1,800',
    services: ['Coronary Angiography & Angioplasty', '2D Echocardiography (ECG)', 'Hypertension & Cholesterol Control', 'Post-Bypass Cardiac Rehabilitation'],
    reviews: [
      { name: 'Subhash G.', rating: 5, comment: 'Saved my life. His angioplasty precision is unmatched. Forever grateful.', date: '15 Jun 2026' },
      { name: 'Meera B.', rating: 5, comment: 'Very reassuring during my father\'s bypass recovery. Excellent follow-up care.', date: '10 Jun 2026' },
      { name: 'Debashis R.', rating: 5, comment: 'Best cardiologist in Kolkata. His ECG analysis is incredibly thorough.', date: '02 Jun 2026' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cardiac Surgery Theater' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS & Fellowship Certificates' },
      { url: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=500&h=350&q=80', label: 'DM Cardiology Degree' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'ECG & Heart Monitoring Room' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Hospital Main Building' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor With Patient Consult' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Reception & Help Desk' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cath Lab Equipment' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Cardiac Checkup Room' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Intensive Care Unit' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'In-House Pharmacy' },
      { url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=500&h=350&q=80', label: 'Patient Recovery Ward' },
    ]
  },
  {
    id: 'doc-3',
    name: 'Dr. Amit Verma',
    specialty: 'General Physician (Family Doctor)',
    qualifications: 'MBBS, MD (General Medicine) — Kasturba Medical College, Manipal',
    experienceYears: 12,
    rating: 4.8,
    consultsCount: 3100,
    address: 'Arogya Family Clinic, 12th Main Road, Indiranagar, Bengaluru — 560038',
    mapLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
    timing: '09:00 AM — 04:00 PM',
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
    aboutDoctor: 'Dr. Amit Verma graduated with an MBBS from Kasturba Medical College, Manipal — one of India\'s top medical institutions. He completed his MD in General Medicine and has been practicing for 12+ years. He specializes in chronic disease management, infectious disease treatment, and preventive health screening. He runs weekly free health camps in rural Bengaluru communities and has been awarded the Karnataka Health Excellence Award in 2024.',
    docPhoto: '/doctors/dr_amit.png',
    assistantName: 'Rahul Singh (Receptionist)',
    assistantPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
    languages: ['Hindi', 'English', 'Kannada'],
    consultFee: '₹400 — ₹600',
    services: ['Chronic Disease Management', 'Preventive Health Checkups', 'Infectious Disease Therapy', 'Diabetes & BP Control'],
    reviews: [
      { name: 'Kavitha R.', rating: 5, comment: 'Such a humble doctor. He explains everything in Kannada so my grandmother understands.', date: '18 Jun 2026' },
      { name: 'Arun P.', rating: 5, comment: 'My family doctor for 5 years. Manages my diabetes perfectly. Highly recommend!', date: '14 Jun 2026' },
      { name: 'Sanjay M.', rating: 4, comment: 'Good doctor, sometimes queue is long but consultation is thorough.', date: '05 Jun 2026' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'Family Clinic Interior' },
      { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&h=350&q=80', label: 'Medical Documents & Degrees' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Convocation Photo' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Consultation Desk Setup' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Waiting Area & Front Desk' },
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Doctor Examining Patient' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Blood Pressure Checkup' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Clinic Building View' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Lab & Diagnostics' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Emergency Care Setup' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Pharmacy & Medicines' },
      { url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=500&h=350&q=80', label: 'Health Camp Photo' },
    ]
  },
  {
    id: 'doc-4',
    name: 'Dr. Priya Patel',
    specialty: 'Dermatologist (Skin Specialist)',
    qualifications: 'MBBS, DDVL (Dermatology) — Grant Medical College, Mumbai',
    experienceYears: 14,
    rating: 4.9,
    consultsCount: 2890,
    address: 'Arogya Skin & Laser Center, Andheri West, Mumbai — 400058',
    mapLink: 'https://maps.google.com/?q=Andheri+West+Mumbai',
    timing: '11:00 AM — 03:00 PM',
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
    aboutDoctor: 'Dr. Priya Patel is a leading Dermatologist from Mumbai with an MBBS and DDVL from Grant Medical College. She has 14 years of experience in clinical dermatology, cosmetic procedures, and advanced laser-based scar management. She regularly publishes in the Indian Journal of Dermatology and conducts skin health awareness workshops across Maharashtra.',
    docPhoto: '/doctors/dr_priya.png',
    assistantName: 'Sneha Shah (Clinical Associate)',
    assistantPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    languages: ['Hindi', 'English', 'Gujarati', 'Marathi'],
    consultFee: '₹700 — ₹1,200',
    services: ['Laser Acne Scar Treatment', 'Anti-Aging & Skin Rejuvenation', 'Clinical Dermatitis & Eczema', 'Hair Fall & PRP Therapy'],
    reviews: [
      { name: 'Pooja D.', rating: 5, comment: 'My acne scars reduced 80% after 3 sessions. Dr. Priya is magic!', date: '20 Jun 2026' },
      { name: 'Vikram T.', rating: 5, comment: 'Finally a dermatologist who doesn\'t push unnecessary products. Very honest advice.', date: '16 Jun 2026' },
      { name: 'Nisha A.', rating: 4, comment: 'Great results with PRP for hair fall. Clinic is very clean and modern.', date: '08 Jun 2026' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=500&h=350&q=80', label: 'Laser Treatment Room' },
      { url: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=500&h=350&q=80', label: 'MBBS Certificate Display' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&h=350&q=80', label: 'Graduation Ceremony Photo' },
      { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skin Consultation Room' },
      { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Center Exterior View' },
      { url: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e99f?auto=format&fit=crop&w=500&h=350&q=80', label: 'Reception & Waiting Hall' },
      { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skin Examination Session' },
      { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=350&q=80', label: 'Procedure Setup Area' },
      { url: 'https://images.unsplash.com/photo-1581056771107-24247a7e6794?auto=format&fit=crop&w=500&h=350&q=80', label: 'Advanced Laser Equipment' },
      { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&h=350&q=80', label: 'Treatment Recovery Room' },
      { url: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=500&h=350&q=80', label: 'Skincare Products Counter' },
      { url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=500&h=350&q=80', label: 'PRP Therapy Station' },
    ]
  }
];

/* ═══════════ Animation Variants ═══════════ */
const pageV = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } }
};

/* ═══════════ Component ═══════════ */
const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ patientName: '', age: '', symptoms: '', phone: '' });
  const [dupErr, setDupErr] = useState('');
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [lastBooked, setLastBooked] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS_DB);

  useEffect(() => {
    const s = localStorage.getItem('arogya_doctor_appointments');
    if (s) setAppts(JSON.parse(s));
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  /* ── Booking ── */
  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setDupErr('');
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    const n = form.patientName.trim().toLowerCase();
    if (appts.some(a => a.patientName.trim().toLowerCase() === n)) {
      setDupErr('Duplicate Booking: A slot is already reserved under this patient name. Cancel the existing appointment first, or use a different name.');
      return;
    }

    const tok = selectedDoctor.activeToken + selectedDoctor.waitingPatients + 1;
    const w = (selectedDoctor.waitingPatients + 1) * selectedDoctor.avgWaitMins;
    const arr = new Date(); arr.setMinutes(arr.getMinutes() + w);

    const a: Appointment = {
      id: 'a-' + Date.now(), doctorId: selectedDoctor.id, doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty, patientName: form.patientName.trim(),
      age: form.age, symptoms: form.symptoms, phone: form.phone,
      timeSlot: selectedSlot, tokenNumber: tok,
      estArrivalTime: arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDate
    };

    const u = [a, ...appts]; setAppts(u);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(u));
    setDoctors(p => p.map(d => d.id === selectedDoctor.id ? { ...d, slotsLeft: Math.max(0, d.slotsLeft - 1), waitingPatients: d.waitingPatients + 1 } : d));
    setLastBooked(a); setStep(6);
  };

  const cancelAppt = (id: string, dn: string) => {
    if (!window.confirm('Cancel this appointment? The slot will be released.')) return;
    const f = appts.filter(a => a.id !== id); setAppts(f);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(f));
    setDoctors(p => p.map(d => d.name === dn ? { ...d, slotsLeft: Math.min(8, d.slotsLeft + 1), waitingPatients: Math.max(0, d.waitingPatients - 1) } : d));
  };

  const openWA = (num: string, msg: string) => window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');

  const dates7 = () => {
    const d = []; const o: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    for (let i = 0; i < 7; i++) { const x = new Date(); x.setDate(x.getDate() + i); d.push({ raw: x.toISOString().split('T')[0], label: x.toLocaleDateString('en-IN', o) }); }
    return d;
  };

  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const slotSt = (doc: Doctor, s: string) => {
    if (doc.lunchBreak !== 'None') { const [a, b] = doc.lunchBreak.split(' - '); if (s >= a && s <= b) return 'LUNCH'; }
    if (doc.surgeryTime !== 'None') { const m = doc.surgeryTime.match(/\d{2}:\d{2}\s*(?:AM|PM)/g); if (m && m.length >= 2 && s >= m[0] && s <= m[1]) return 'SURGERY'; }
    return 'FREE';
  };

  const goBack = () => { if (step === 1) navigate('/dashboard'); else if (step === 2) setStep(1); else setStep(2); };

  const renderStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(r) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
  ));

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={goBack}
              className="mr-4 p-2.5 rounded-full bg-card-surface shadow-lg border border-card-custom cursor-pointer">
              <ArrowLeft className="h-5 w-5 text-secondary-custom" />
            </motion.button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary-custom">AI Doctor Booking</h1>
              <p className="text-secondary-custom text-xs mt-0.5">Powered by Arogya Care</p>
            </div>
          </div>
          <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest font-black hidden sm:inline">Development Preview</span>
        </div>

        <AnimatePresence mode="wait">

          {/* ═══ STEP 1: WARNING DISCLAIMER ONLY ═══ */}
          {step === 1 && (
            <motion.div key="s1" variants={pageV} initial="initial" animate="animate" exit="exit" className="flex justify-center py-12">
              <motion.div className="w-full max-w-lg bg-card-surface border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden" whileHover={{ rotateX: 1, rotateY: -1 }}>
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
                <div className="p-8 md:p-10">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div className="absolute inset-0 bg-red-500 rounded-2xl rotate-6 opacity-20" animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 bg-red-500 rounded-2xl -rotate-6 opacity-15" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl shadow-red-600/30">
                      <ShieldAlert className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-primary-custom text-center tracking-tight uppercase mb-2">Warning</h2>
                  <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-black text-center mb-8">Development Mode &bull; Sandbox Preview</p>
                  <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 text-[13px] text-secondary-custom leading-relaxed space-y-3 mb-8">
                    <p>This scheduling module is a <strong className="text-primary-custom">simulated development preview</strong>. All doctor listings, time-slot allocations, surgery schedules, and token queues use mock data for demonstration.</p>
                    <p className="text-red-400 font-semibold">Future production releases will integrate real-time hospital APIs. No payment is processed inside this application.</p>
                  </div>
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3.5 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer">
                      Acknowledge & Proceed <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ STEP 2: DOCTOR LIST — Photo + Name + Specialty ONLY ═══ */}
          {step === 2 && (
            <motion.div key="s2" variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <h2 className="text-xl font-black text-primary-custom">Select a Specialist</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {doctors.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, boxShadow: '0 20px 40px rgba(124,58,237,0.12)' }}
                    className="bg-card-surface border border-card-custom rounded-3xl p-5 shadow-lg cursor-pointer overflow-hidden">
                    <div className="flex items-center space-x-4 mb-5">
                      <img src={doc.docPhoto} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/20 shadow-md" />
                      <div>
                        <h3 className="font-black text-primary-custom text-base flex items-center gap-2">
                          {doc.name}
                          {doc.emergencyAway && <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Unavailable</span>}
                        </h3>
                        <p className="text-[11px] text-brand-from font-extrabold uppercase tracking-wide">{doc.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">{renderStars(doc.rating)} <span className="text-[10px] text-secondary-custom ml-1 font-semibold">{doc.rating}</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-card-custom pt-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-purple-500/10 hover:border-purple-500/30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold text-secondary-custom flex flex-col items-center gap-1 cursor-pointer transition-all">
                        <User className="h-4 w-4 text-purple-500" /> About Doctor
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedDoctor(doc); setStep(4); }}
                        className="py-2.5 bg-white/5 border border-card-custom hover:bg-blue-500/10 hover:border-blue-500/30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold text-secondary-custom flex flex-col items-center gap-1 cursor-pointer transition-all">
                        <Image className="h-4 w-4 text-blue-500" /> Clinic & Degrees
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={doc.emergencyAway}
                        onClick={() => { setSelectedDoctor(doc); setSelectedSlot(''); setForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDupErr(''); setStep(5); }}
                        className="py-2.5 bg-brand-gradient text-white disabled:opacity-30 rounded-xl text-[9px] uppercase tracking-wider font-extrabold flex flex-col items-center gap-1 cursor-pointer shadow-md">
                        <Calendar className="h-4 w-4" /> Book Slot
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Active Bookings */}
              {appts.length > 0 && (
                <div className="border-t border-card-custom pt-8 mt-8">
                  <h3 className="text-base font-black text-primary-custom mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> My Active Appointments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {appts.map(a => (
                      <motion.div key={a.id} whileHover={{ scale: 1.01 }} className="bg-card-surface border border-card-custom rounded-2xl p-4 flex justify-between items-start shadow-sm">
                        <div className="space-y-1 text-xs">
                          <h4 className="font-extrabold text-primary-custom">{a.doctorName}</h4>
                          <p className="text-secondary-custom">Patient: <strong>{a.patientName}</strong> ({a.age} yrs) &bull; {a.symptoms}</p>
                          <p className="text-brand-from font-bold">{a.date} at {a.timeSlot} &bull; Token #{a.tokenNumber} &bull; Arrive ~{a.estArrivalTime}</p>
                        </div>
                        <button onClick={() => cancelAppt(a.id, a.doctorName)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl cursor-pointer" title="Cancel"><Trash2 className="h-4 w-4" /></button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 3: ABOUT DOCTOR — Full Bio ═══ */}
          {step === 3 && selectedDoctor && (
            <motion.div key="s3" variants={pageV} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-6">
              <motion.div whileHover={{ rotateY: -1.5, rotateX: 0.5 }} className="relative rounded-3xl overflow-hidden shadow-2xl border border-card-custom">
                <img src={selectedDoctor.docPhoto} alt={selectedDoctor.name} className="w-full h-72 md:h-80 object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{renderStars(selectedDoctor.rating)}</div>
                    <span className="text-xs text-white/70 font-semibold">{selectedDoctor.rating} &bull; {selectedDoctor.consultsCount}+ consultations</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedDoctor.name}</h2>
                  <p className="text-sm text-purple-300 font-extrabold uppercase tracking-wider">{selectedDoctor.specialty}</p>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <GraduationCap className="h-5 w-5 text-purple-500" />, label: 'Degree', val: selectedDoctor.qualifications.split(',')[0] },
                  { icon: <Briefcase className="h-5 w-5 text-brand-from" />, label: 'Experience', val: `${selectedDoctor.experienceYears}+ Yrs` },
                  { icon: <Globe className="h-5 w-5 text-blue-500" />, label: 'Languages', val: selectedDoctor.languages.join(', ') },
                  { icon: <Activity className="h-5 w-5 text-emerald-500" />, label: 'Consult Fee', val: selectedDoctor.consultFee },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.04, rotateX: 2 }} className="bg-card-surface border border-card-custom p-3 rounded-2xl text-center shadow-md">
                    <div className="flex justify-center mb-1.5">{s.icon}</div>
                    <span className="block text-[7px] text-secondary-custom uppercase tracking-wider font-extrabold">{s.label}</span>
                    <span className="text-[10px] font-black text-primary-custom mt-0.5 block leading-tight">{s.val}</span>
                  </motion.div>
                ))}
              </div>

              {/* Bio, Qualifications, Personality */}
              <div className="bg-card-surface border border-card-custom rounded-2xl p-5 shadow-md space-y-4 text-xs">
                <div><span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">Full Education</span><p className="font-bold text-primary-custom">{selectedDoctor.qualifications}</p></div>
                <div className="border-t border-card-custom pt-3"><span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">About {selectedDoctor.name}</span><p className="text-secondary-custom leading-relaxed">{selectedDoctor.aboutDoctor}</p></div>
                <div className="border-t border-card-custom pt-3"><span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-1">Doctor Nature & Personality</span><p className="text-secondary-custom italic">"{selectedDoctor.personality}"</p></div>
              </div>

              {/* Services */}
              <div>
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-2">Specialization Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.services.map((s, i) => <span key={i} className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-xl">{s}</span>)}
                </div>
              </div>

              {/* Patient Reviews */}
              <div>
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider mb-2">Verified Patient Reviews</span>
                <div className="space-y-2">
                  {selectedDoctor.reviews.map((r, i) => (
                    <div key={i} className="bg-card-surface border border-card-custom rounded-xl p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-primary-custom">{r.name}</span>
                          <div className="flex">{renderStars(r.rating)}</div>
                        </div>
                        <span className="text-[9px] text-secondary-custom">{r.date}</span>
                      </div>
                      <p className="text-secondary-custom">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-card-custom">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to List
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={selectedDoctor.emergencyAway}
                  onClick={() => { setSelectedSlot(''); setForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDupErr(''); setStep(5); }}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2">
                  Book Appointment <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4: ABOUT CLINIC — 12 Photo Album + Location ═══ */}
          {step === 4 && selectedDoctor && (
            <motion.div key="s4" variants={pageV} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-xl font-black text-primary-custom">
                Clinic & Credential Gallery
                <span className="block text-xs text-secondary-custom font-semibold mt-0.5 normal-case">{selectedDoctor.name} — {selectedDoctor.specialty}</span>
              </h2>

              {/* 12 Photo Album Grid */}
              <div className="grid grid-cols-3 gap-3">
                {selectedDoctor.gallery.map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                    whileHover={{ scale: 1.06, rotateX: 3, rotateY: -3, zIndex: 10 }}
                    className="relative rounded-2xl overflow-hidden border border-card-custom shadow-md h-28 md:h-36 cursor-pointer group">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[9px] text-white font-bold">{img.label}</span>
                    </div>
                    <span className="absolute top-1.5 left-1.5 text-[7px] bg-black/70 text-white px-1.5 py-0.5 rounded font-bold">{i + 1}/{selectedDoctor.gallery.length}</span>
                  </motion.div>
                ))}
              </div>

              {/* Coordinator / Assistant */}
              <div className="bg-card-surface border border-card-custom rounded-2xl p-4 flex items-center space-x-4 shadow-md">
                <img src={selectedDoctor.assistantPhoto} alt="" className="w-12 h-12 rounded-full object-cover border border-card-custom" />
                <div>
                  <span className="block text-[8px] text-secondary-custom uppercase tracking-wider font-extrabold">Assigned Coordinator</span>
                  <span className="text-xs font-black text-primary-custom">{selectedDoctor.assistantName}</span>
                </div>
              </div>

              {/* Location */}
              <motion.div whileHover={{ rotateX: 1, rotateY: -1 }} className="bg-card-surface border border-card-custom rounded-2xl p-5 shadow-md space-y-3">
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider">Clinic Location</span>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary-custom font-semibold leading-relaxed">{selectedDoctor.address}</p>
                </div>
                <a href={selectedDoctor.mapLink} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[10px] uppercase text-center">
                  Open in Google Maps
                </a>
              </motion.div>

              <div className="flex gap-4 pt-4 border-t border-card-custom">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to List
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={selectedDoctor.emergencyAway}
                  onClick={() => { setSelectedSlot(''); setForm({ patientName: '', age: '', symptoms: '', phone: '' }); setDupErr(''); setStep(5); }}
                  className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2">
                  Book Appointment <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 5: BOOK APPOINTMENT ═══ */}
          {step === 5 && selectedDoctor && (
            <motion.div key="s5" variants={pageV} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-card-custom pb-4">
                <div>
                  <span className="text-[9px] text-brand-from font-extrabold uppercase tracking-wider">Booking For</span>
                  <h3 className="font-extrabold text-lg text-primary-custom">{selectedDoctor.name}</h3>
                  <p className="text-[10px] text-secondary-custom">{selectedDoctor.specialty} &bull; {selectedDoctor.timing}</p>
                </div>
                <div className="text-right"><span className="text-[9px] text-emerald-500 font-extrabold">{selectedDoctor.slotsLeft} slots left</span></div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  Arogya Care does <strong>not</strong> collect any payment. After booking, pay directly at the clinic reception or via the assistant on WhatsApp.
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">1. Choose Date</label>
                <div className="grid grid-cols-4 gap-2">
                  {dates7().map(d => (
                    <motion.button key={d.raw} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDate(d.raw)}
                      className={`p-2.5 rounded-xl border text-[10px] font-extrabold text-center cursor-pointer transition-all ${selectedDate === d.raw ? 'bg-brand-gradient text-white border-transparent shadow-md' : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'}`}>
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div>
                <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider mb-2">2. Select Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(s => {
                    const st = slotSt(selectedDoctor, s);
                    return (
                      <motion.button key={s} whileHover={st === 'FREE' ? { scale: 1.05 } : {}} whileTap={st === 'FREE' ? { scale: 0.95 } : {}}
                        disabled={st !== 'FREE'} onClick={() => setSelectedSlot(s)}
                        className={`p-2 rounded-xl border text-[10px] font-bold text-center flex flex-col items-center cursor-pointer transition-all ${
                          st === 'LUNCH' ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 opacity-50 cursor-not-allowed'
                          : st === 'SURGERY' ? 'bg-red-500/10 border-red-500/25 text-red-500 opacity-50 cursor-not-allowed'
                          : selectedSlot === s ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md'
                          : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10'
                        }`}>
                        <span>{s}</span>
                        <span className="text-[7px] mt-0.5 opacity-60">{st === 'LUNCH' ? 'Lunch' : st === 'SURGERY' ? 'Surgery' : 'Free'}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              {selectedDate && selectedSlot && (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitBooking} className="space-y-4 pt-4 border-t border-card-custom">
                  <label className="block text-[9px] font-black text-secondary-custom uppercase tracking-wider">3. Patient Details</label>
                  <input type="text" required placeholder="Patient Full Name" value={form.patientName} onChange={e => { setForm({ ...form, patientName: e.target.value }); setDupErr(''); }}
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" required placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                    <input type="tel" required placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                  </div>
                  <input type="text" required placeholder="Describe Symptoms" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from" />
                  {dupErr && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-[10px] font-bold flex items-start space-x-2"><ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" /><span>{dupErr}</span></div>}
                  <div className="flex gap-4 pt-2">
                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-white/5 border border-card-custom text-secondary-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer">Back</motion.button>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-brand-gradient text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer">Confirm Booking</motion.button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 6: SUCCESS + WhatsApp Multi-Contact ═══ */}
          {step === 6 && lastBooked && selectedDoctor && (
            <motion.div key="s6" variants={pageV} initial="initial" animate="animate" exit="exit" className="max-w-md mx-auto bg-card-surface border border-card-custom rounded-3xl p-6 shadow-2xl text-center space-y-6">
              <motion.div animate={{ scale: [0.8, 1.2, 1] }} transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <CheckCircle className="h-8 w-8" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-primary-custom">🎉 Booking Confirmed!</h3>
                <p className="text-xs text-secondary-custom mt-1">Your slot token has been reserved via Arogya Care.</p>
              </div>
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom rounded-2xl p-4 text-left space-y-2 text-xs font-semibold">
                <div className="flex justify-between"><span className="text-secondary-custom">Specialist:</span><span className="text-primary-custom">{lastBooked.doctorName}</span></div>
                <div className="flex justify-between"><span className="text-secondary-custom">Date & Time:</span><span className="text-primary-custom">{lastBooked.date} at {lastBooked.timeSlot}</span></div>
                <div className="flex justify-between border-t border-card-custom pt-2 mt-2"><span className="text-secondary-custom">Queue Token:</span><span className="text-brand-from font-black text-sm">#{lastBooked.tokenNumber}</span></div>
                <div className="flex justify-between"><span className="text-secondary-custom">Est. Arrival:</span><span className="text-emerald-500 font-black text-sm">{lastBooked.estArrivalTime}</span></div>
              </div>
              <div className="space-y-2">
                <span className="block text-[8px] text-secondary-custom font-black uppercase tracking-wider">Confirm via WhatsApp</span>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => openWA(selectedDoctor.whatsapp, `Hi! I would like to book a slot for ${lastBooked.patientName}, Age: ${lastBooked.age}, Symptoms: ${lastBooked.symptoms} on ${lastBooked.date} at ${lastBooked.timeSlot} under ${lastBooked.doctorName}. I found your clinic on the Arogya Care App. Please confirm my appointment.`)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 cursor-pointer">
                  <MessageSquare className="h-4 w-4" /> WhatsApp Doctor
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => openWA(selectedDoctor.assistantWhatsapp, `Hi, I booked a slot for ${lastBooked.patientName} on ${lastBooked.date} at ${lastBooked.timeSlot} with ${lastBooked.doctorName} via Arogya Care App (Token #${lastBooked.tokenNumber}). Please confirm.`)}
                  className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 font-bold rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 cursor-pointer">
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Assistant ({selectedDoctor.assistantName.split(' ')[0]})
                </motion.button>
                <a href={`tel:${selectedDoctor.receptionPhone}`}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[10px] uppercase flex items-center justify-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> Call Reception Desk
                </a>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-extrabold rounded-xl text-xs uppercase cursor-pointer mt-4">
                Done — Back to Doctors
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default AIDoctorBookingPage;
