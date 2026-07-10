import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bot, Calendar, Clock, Phone, MessageSquare, 
  Users, CheckCircle, AlertTriangle, Send, Coffee, Check, X
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
  timing: string;
  slotsLeft: number;
  lunchBreak: string;
  emergencyAway: boolean;
  activeToken: number;
  waitingPatients: number;
  avgWaitMins: number;
  phone: string;
  whatsapp: string;
}

const AIDoctorBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Doctors Static Data with detailed availability status
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 'doc-1',
      name: 'Dr. Neha Sharma',
      specialty: 'Pediatrician',
      timing: '10:00 AM - 01:00 PM',
      slotsLeft: 2,
      lunchBreak: '01:00 PM - 02:00 PM',
      emergencyAway: false,
      activeToken: 5,
      waitingPatients: 3,
      avgWaitMins: 15,
      phone: '+919876543201',
      whatsapp: '919876543201'
    },
    {
      id: 'doc-2',
      name: 'Dr. Rajesh Iyer',
      specialty: 'Cardiologist',
      timing: '02:00 PM - 06:00 PM',
      slotsLeft: 0,
      lunchBreak: 'None',
      emergencyAway: true, // Away on surgery emergency
      activeToken: 0,
      waitingPatients: 0,
      avgWaitMins: 0,
      phone: '+919876543202',
      whatsapp: '919876543202'
    },
    {
      id: 'doc-3',
      name: 'Dr. Amit Verma',
      specialty: 'General Physician',
      timing: '09:00 AM - 04:00 PM',
      slotsLeft: 1,
      lunchBreak: '01:00 PM - 02:00 PM',
      emergencyAway: false,
      activeToken: 12,
      waitingPatients: 5,
      avgWaitMins: 10,
      phone: '+919876543203',
      whatsapp: '919876543203'
    },
    {
      id: 'doc-4',
      name: 'Dr. Priya Patel',
      specialty: 'Dermatologist',
      timing: '11:00 AM - 03:00 PM',
      slotsLeft: 4,
      lunchBreak: 'None',
      emergencyAway: false,
      activeToken: 8,
      waitingPatients: 2,
      avgWaitMins: 12,
      phone: '+919876543204',
      whatsapp: '919876543204'
    }
  ]);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    age: '',
    symptoms: '',
    phone: '',
    timeSlot: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBookedAppointment, setLastBookedAppointment] = useState<Appointment | null>(null);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; action?: string }>>([
    {
      sender: 'bot',
      text: 'Namaste! I am your Arogya Assistant. I can help you check doctors availability, book checkup slots, and get queue estimates. Which doctor or specialty are you looking for?'
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // Load appointments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arogya_doctor_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    // Calculate token number
    const token = selectedDoctor.activeToken + selectedDoctor.waitingPatients + 1;
    const estWait = selectedDoctor.waitingPatients * selectedDoctor.avgWaitMins + selectedDoctor.avgWaitMins;
    
    // Estimate arrival time
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
      timeSlot: bookingForm.timeSlot || selectedDoctor.timing.split(' - ')[0],
      tokenNumber: token,
      estArrivalTime,
      date: new Date().toLocaleDateString()
    };

    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('arogya_doctor_appointments', JSON.stringify(updatedAppointments));

    // Update Doctor Slots in State
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
    
    // Reset booking state
    setSelectedDoctor(null);
    setBookingForm({
      patientName: '',
      age: '',
      symptoms: '',
      phone: '',
      timeSlot: ''
    });

    // Add success message to chatbot log
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `Success! Booked appointment with ${newAppointment.doctorName}. Token Number: #${newAppointment.tokenNumber}. Estimated consult arrival time: ${newAppointment.estArrivalTime}. Please show this token at the reception desk.`
      }
    ]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');

    setTimeout(() => {
      processAgentResponse(userText);
    }, 600);
  };

  const processAgentResponse = (text: string) => {
    const cleanText = text.toLowerCase();
    
    // Check doctor availability keywords
    if (cleanText.includes('neha') || cleanText.includes('pediatrician') || cleanText.includes('child')) {
      const doc = doctors.find(d => d.id === 'doc-1')!;
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Dr. Neha Sharma (Pediatrician) is available from ${doc.timing}. She has ${doc.slotsLeft} slots remaining before her lunch break at ${doc.lunchBreak}. Would you like to book a slot?`,
          action: 'book-doc-1'
        }
      ]);
    } else if (cleanText.includes('rajesh') || cleanText.includes('cardio') || cleanText.includes('heart')) {
      const doc = doctors.find(d => d.id === 'doc-2')!;
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `NOTICE: Dr. Rajesh Iyer (Cardiologist) is currently away on emergency surgery. All slot checkups are paused. Please contact reception at ${doc.phone} for immediate concerns.`
        }
      ]);
    } else if (cleanText.includes('amit') || cleanText.includes('general') || cleanText.includes('physician') || cleanText.includes('fever')) {
      const doc = doctors.find(d => d.id === 'doc-3')!;
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Dr. Amit Verma (General Physician) is available from ${doc.timing}. Slots left: ${doc.slotsLeft}. Current live waiting queue has ${doc.waitingPatients} patients. Estimated wait time: ${doc.waitingPatients * doc.avgWaitMins} mins. Book now?`,
          action: 'book-doc-3'
        }
      ]);
    } else if (cleanText.includes('priya') || cleanText.includes('skin') || cleanText.includes('derma')) {
      const doc = doctors.find(d => d.id === 'doc-4')!;
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Dr. Priya Patel (Dermatologist) is available from ${doc.timing}. Slots left: ${doc.slotsLeft}. Queue wait is short (approx ${doc.waitingPatients * doc.avgWaitMins} mins). Would you like to reserve a slot?`,
          action: 'book-doc-4'
        }
      ]);
    } else if (cleanText.includes('book') || cleanText.includes('appointment') || cleanText.includes('slot')) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sure! Please click "Book Appointment" on the doctor cards list to the right, or tell me which doctor you prefer: Dr. Neha, Dr. Amit, or Dr. Priya.'
        }
      ]);
    } else if (cleanText.includes('hi') || cleanText.includes('hello') || cleanText.includes('hola') || cleanText.includes('namaste')) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Hello! I can search clinic availability, live wait lists, or book slots. Please select or mention a doctor.'
        }
      ]);
    } else {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I didn't quite catch that. You can ask: 'Is Dr. Amit available?', 'What is the wait time for Dr. Neha?', or tell me to book an appointment with Priya."
        }
      ]);
    }
  };

  const handleActionClick = (actionCode: string) => {
    const docId = actionCode.split('-').pop();
    const doc = doctors.find(d => d.id === `doc-${docId}`);
    if (doc) {
      if (doc.emergencyAway) {
        alert("Doctor is currently away on emergency surgery!");
      } else {
        setSelectedDoctor(doc);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2.5 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary-custom">
                {t('doctorBooking')}
              </h1>
              <p className="text-secondary-custom mt-1">
                AI-driven slots booking assistant & live token queue checkouts
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3D Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: AI Agent Conversation Bot (Column Span 5) */}
          <div className="lg:col-span-5 flex flex-col h-[620px] bg-card-surface border border-card-custom rounded-3xl shadow-xl overflow-hidden relative">
            
            {/* Bot Header */}
            <div className="bg-brand-gradient p-4 text-white flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">Arogya Booking Agent</h3>
                <span className="text-[10px] text-white/85 uppercase tracking-widest font-bold">Online & Active</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-tr-none'
                      : 'bg-white/5 border border-card-custom text-primary-custom rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.action && (
                      <button
                        onClick={() => handleActionClick(msg.action!)}
                        className="mt-3 w-full py-2 bg-brand-gradient text-white font-bold rounded-xl text-[10px] uppercase tracking-wider"
                      >
                        Confirm Slot Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-card-custom flex gap-2 bg-black/5 dark:bg-black/20">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Ask about Dr. Amit, Dr. Neha, or book slots..."
                className="flex-1 px-4 py-2.5 bg-card-surface border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
              />
              <button
                type="submit"
                className="p-2.5 bg-brand-gradient text-white rounded-xl shadow-md flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Panel: Doctor Schedules (Column Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Warning Alert Banner */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <p className="text-[11px] text-orange-500 font-semibold leading-relaxed">
                {t('noPaymentApp')} Confirm slots booking directly. Advance payment is not required inside the application.
              </p>
            </div>

            <h2 className="text-xl font-extrabold text-primary-custom">Available Specialists</h2>

            {/* Doctor 3D cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <motion.div
                  key={doc.id}
                  className={`bg-card-surface border rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between ${
                    doc.emergencyAway ? 'border-red-500/30' : 'border-card-custom'
                  }`}
                  style={{ perspective: 1000 }}
                  whileHover={!doc.emergencyAway ? { 
                    scale: 1.02,
                    rotateX: 3, 
                    rotateY: -3,
                    boxShadow: '0 12px 30px rgba(124, 58, 237, 0.15)'
                  } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div>
                    {/* Header: Name & Speciality */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-primary-custom">{doc.name}</h3>
                        <p className="text-[10px] text-secondary-custom uppercase tracking-wider font-semibold">
                          {doc.specialty}
                        </p>
                      </div>
                      
                      {/* Slots remaining pill */}
                      {!doc.emergencyAway && (
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                          doc.slotsLeft > 2 
                            ? 'bg-green-500/10 text-green-500' 
                            : doc.slotsLeft > 0 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {doc.slotsLeft} {t('remainingSlots')}
                        </span>
                      )}
                    </div>

                    {/* Absence banner if emergencyAway */}
                    {doc.emergencyAway ? (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 flex items-start space-x-2 mb-4">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-[10px] font-semibold leading-relaxed">
                          {t('emergencyAway')}
                        </span>
                      </div>
                    ) : (
                      /* Timings list */
                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex items-center text-secondary-custom">
                          <Clock className="h-3.5 w-3.5 mr-2 text-brand-from" />
                          <span>{doc.timing}</span>
                        </div>
                        {doc.lunchBreak !== 'None' && (
                          <div className="flex items-center text-secondary-custom/75">
                            <Coffee className="h-3.5 w-3.5 mr-2 text-amber-500" />
                            <span>{t('lunchBreak')}: {doc.lunchBreak}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live Queue indicators */}
                    {!doc.emergencyAway && (
                      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 grid grid-cols-3 gap-2 mb-4 text-center">
                        <div>
                          <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Active</span>
                          <span className="text-sm font-black text-primary-custom">#{doc.activeToken}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Waiting</span>
                          <span className="text-sm font-black text-purple-500">#{doc.waitingPatients}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Est. Wait</span>
                          <span className="text-sm font-black text-emerald-500">{doc.waitingPatients * doc.avgWaitMins}m</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 mt-auto">
                    {doc.emergencyAway ? (
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${doc.phone}`}
                          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-card-custom font-bold rounded-xl text-[10px] uppercase text-center flex items-center justify-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5 text-secondary-custom" /> {t('contactReception')}
                        </a>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          disabled={doc.slotsLeft === 0}
                          className="w-full py-2.5 bg-brand-gradient disabled:opacity-40 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Calendar className="h-4 w-4" /> {t('bookAppointment')}
                        </button>
                        
                        <div className="flex gap-2">
                          <a 
                            href={`https://wa.me/${doc.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 font-bold rounded-xl text-[9px] uppercase tracking-wider text-center flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </a>
                          <a 
                            href={`tel:${doc.phone}`}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-secondary-custom border border-card-custom font-bold rounded-xl text-[9px] uppercase tracking-wider text-center flex items-center justify-center gap-1"
                          >
                            <Phone className="h-3 w-3" /> {t('contactAssistant')}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* My Appointments list */}
            {appointments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-extrabold text-primary-custom mb-4">My Booked Appointments</h3>
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <motion.div
                      key={app.id}
                      className="bg-card-surface border border-card-custom rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-primary-custom">{app.doctorName}</h4>
                          <span className="text-[9px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold uppercase">
                            {app.specialty}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-custom mt-1">
                          Patient: <span className="font-bold">{app.patientName}</span> ({app.age} yrs) | Time slot: {app.timeSlot}
                        </p>
                      </div>

                      <div className="mt-3 md:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Queue Token</span>
                          <span className="text-lg font-black text-brand-from">#{app.tokenNumber}</span>
                        </div>
                        <div className="text-right border-l border-card-custom pl-4">
                          <span className="block text-[8px] text-secondary-custom uppercase tracking-wider">Est. Consult Time</span>
                          <span className="text-lg font-black text-emerald-500">{app.estArrivalTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-card-surface border border-card-custom rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 text-secondary-custom hover:text-primary-custom"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold text-primary-custom mb-2">Book Slot Details</h3>
              <p className="text-xs text-secondary-custom mb-6">
                Fill details for Dr. {selectedDoctor.name} ({selectedDoctor.specialty})
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-secondary-custom uppercase mb-1.5 tracking-wider">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.patientName}
                    onChange={e => setBookingForm({...bookingForm, patientName: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary-custom uppercase mb-1.5 tracking-wider">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      required
                      value={bookingForm.age}
                      onChange={e => setBookingForm({...bookingForm, age: e.target.value})}
                      placeholder="e.g. 28"
                      className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary-custom uppercase mb-1.5 tracking-wider">
                      Phone Number
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
                  <label className="block text-[10px] font-bold text-secondary-custom uppercase mb-1.5 tracking-wider">
                    Brief Symptoms
                  </label>
                  <textarea
                    required
                    value={bookingForm.symptoms}
                    onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}
                    placeholder="Describe symptoms briefly (e.g. fever, headache, back pain)"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-xs text-primary-custom focus:outline-none focus:border-brand-from resize-none"
                  />
                </div>

                {/* Secure warning notice */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-semibold leading-relaxed">
                  * Pay directly at the reception desk upon check-in arrival. No cash is collected inside the application.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-gradient text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                >
                  Confirm appointment booking
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && lastBookedAppointment && (
          <motion.div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-card-surface border border-card-custom rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <Check className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-black text-primary-custom mb-1">Booking Confirmed!</h3>
              <p className="text-xs text-secondary-custom mb-6">
                Your appointment request is registered successfully.
              </p>

              <div className="bg-white/5 border border-card-custom rounded-2xl p-4 text-left space-y-2 text-xs mb-6">
                <div>
                  <span className="text-secondary-custom">Doctor:</span>
                  <span className="font-extrabold text-primary-custom float-right">{lastBookedAppointment.doctorName}</span>
                </div>
                <div>
                  <span className="text-secondary-custom">Token Position:</span>
                  <span className="font-black text-brand-from float-right">#{lastBookedAppointment.tokenNumber}</span>
                </div>
                <div>
                  <span className="text-secondary-custom">Consult Arrival Time:</span>
                  <span className="font-black text-emerald-500 float-right">{lastBookedAppointment.estArrivalTime}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-brand-gradient text-white font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                Okay, got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIDoctorBookingPage;
