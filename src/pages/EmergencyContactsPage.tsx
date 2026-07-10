import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Phone, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  AlertTriangle, 
  MapPin, 
  MessageSquare, 
  Save, 
  X, 
  User, 
  Heart, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Smartphone,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useLanguage } from '../hooks/useLanguage';


interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  countryCode: string;
  avatar?: string;
  isPrimary: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const EmergencyContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State management
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTestMode, setShowTestMode] = useState(false);
  const [lastEmergencyAction, setLastEmergencyAction] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [userName, setUserName] = useState('User');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    countryCode: '+1',
    avatar: 'bg-red-500'
  });

  // Relationship options
  const relationshipOptions = [
    'Mother', 'Father', 'Spouse', 'Partner', 'Sibling', 'Child',
    'Friend', 'Roommate', 'Colleague', 'Doctor', 'Neighbor', 'Other'
  ];

  // Avatar options
  const avatarOptions = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'
  ];

  // Country codes
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: 'US' },
    { code: '+91', country: 'India', flag: 'IN' },
    { code: '+44', country: 'UK', flag: 'UK' },
    { code: '+49', country: 'Germany', flag: 'DE' },
    { code: '+33', country: 'France', flag: 'FR' },
    { code: '+81', country: 'Japan', flag: 'JP' },
    { code: '+86', country: 'China', flag: 'CN' },
    { code: '+61', country: 'Australia', flag: 'AU' }
  ];


  // Load data on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergency_contacts');
    const savedUserName = localStorage.getItem('user_name') || 'User';
    const savedLastAction = localStorage.getItem('last_emergency_action');
    
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    
    setUserName(savedUserName);
    
    if (savedLastAction) {
      setLastEmergencyAction(savedLastAction);
    }

    // Check location permission
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as any);
      });
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (newContacts: EmergencyContact[]) => {
    setContacts(newContacts);
    localStorage.setItem('emergency_contacts', JSON.stringify(newContacts));
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
  };

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setCurrentLocation(locationData);
          setLocationPermission('granted');
          resolve(locationData);
        },
        (error) => {
          setLocationPermission('denied');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Format phone number
  const formatPhoneNumber = (phone: string, countryCode: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `${countryCode}${cleanPhone}`;
  };

  // Validate phone number
  const isValidPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };

  // Check for duplicate phone numbers
  const isDuplicatePhone = (phone: string, countryCode: string, excludeId?: string) => {
    const formattedPhone = formatPhoneNumber(phone, countryCode);
    return contacts.some(contact => 
      contact.id !== excludeId && 
      formatPhoneNumber(contact.phone, contact.countryCode) === formattedPhone
    );
  };

  // Add or update contact
  const saveContact = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isValidPhoneNumber(formData.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (isDuplicatePhone(formData.phone, formData.countryCode, editingContact?.id)) {
      alert('This phone number is already saved');
      return;
    }

    if (contacts.length >= 5 && !editingContact) {
      alert('You can only save up to 5 emergency contacts');
      return;
    }

    const timestamp = new Date().toISOString();
    
    if (editingContact) {
      // Update existing contact
      const updatedContacts = contacts.map(contact =>
        contact.id === editingContact.id
          ? {
              ...contact,
              ...formData,
              lastUpdated: timestamp
            }
          : contact
      );
      saveContacts(updatedContacts);
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...formData,
        isPrimary: contacts.length === 0, // First contact becomes primary
        createdAt: timestamp,
        lastUpdated: timestamp
      };
      saveContacts([...contacts, newContact]);
    }

    // Reset form
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      countryCode: '+1',
      avatar: 'bg-red-500'
    });
    setShowAddForm(false);
    setEditingContact(null);
  };

  // Delete contact
  const deleteContact = (id: string) => {
    const contactToDelete = contacts.find(c => c.id === id);
    if (!contactToDelete) return;

    const updatedContacts = contacts.filter(contact => contact.id !== id);
    
    // If deleted contact was primary, make the first remaining contact primary
    if (contactToDelete.isPrimary && updatedContacts.length > 0) {
      updatedContacts[0].isPrimary = true;
    }
    
    saveContacts(updatedContacts);
    setShowDeleteConfirm(null);
  };

  // Set primary contact
  const setPrimaryContact = (id: string) => {
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    }));
    saveContacts(updatedContacts);
  };

  // Start editing contact
  const startEditing = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      countryCode: contact.countryCode,
      avatar: contact.avatar || 'bg-red-500'
    });
    setEditingContact(contact);
    setShowAddForm(true);
  };

  // Make emergency call
  const makeEmergencyCall = (contact: EmergencyContact) => {
    const phoneNumber = formatPhoneNumber(contact.phone, contact.countryCode);
    
    if (showTestMode) {
      alert(`TEST MODE: Would call ${contact.name} at ${phoneNumber}`);
      return;
    }

    // Record emergency action
    const timestamp = new Date().toISOString();
    setLastEmergencyAction(`Called ${contact.name} at ${new Date().toLocaleString()}`);
    localStorage.setItem('last_emergency_action', `Called ${contact.name} at ${new Date().toLocaleString()}`);
    
    // Make actual call
    window.open(`tel:${phoneNumber}`, '_self');
    setShowEmergencyDialog(false);
  };

  // Send emergency SMS
  const sendEmergencySMS = async (contact: EmergencyContact) => {
    const phoneNumber = formatPhoneNumber(contact.phone, contact.countryCode);
    
    let locationText = '';
    try {
      const location = await getCurrentLocation();
      const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      locationText = ` I'm at: ${mapsUrl}`;
    } catch (error) {
      console.warn('Could not get location:', error);
      locationText = ' (Location unavailable)';
    }

    const message = `This is ${userName}. I'm in an emergency${locationText}. Please help!`;
    
    if (showTestMode) {
      alert(`TEST MODE: Would send SMS to ${contact.name}:\n\n"${message}"`);
      return;
    }

    // Record emergency action
    const timestamp = new Date().toISOString();
    setLastEmergencyAction(`Sent emergency SMS to ${contact.name} at ${new Date().toLocaleString()}`);
    localStorage.setItem('last_emergency_action', `Sent emergency SMS to ${contact.name} at ${new Date().toLocaleString()}`);
    
    // Send SMS
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_self');
    setShowEmergencyDialog(false);
  };

  // Format last updated time
  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Animation */}
        {showSaveAnimation && (
          <motion.div
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
          >
            Emergency contacts saved
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-custom">{t('emergencyContacts')}</h1>
              <p className="text-secondary-custom mt-1">Stay prepared with trusted emergency contacts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowTestMode(!showTestMode)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                showTestMode 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white/10 text-secondary-custom'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Test Mode
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(true)}
              disabled={contacts.length >= 5}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-5 w-5" />
              <span>Add Contact</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Emergency Action Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.button
            onClick={() => setShowEmergencyDialog(true)}
            disabled={contacts.length === 0}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 rounded-3xl font-bold text-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0.7)",
                "0 0 0 10px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="h-8 w-8" />
              <span>EMERGENCY</span>
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="text-sm font-normal mt-2 opacity-90">
              {contacts.length === 0 
                ? 'Add emergency contacts to enable this feature'
                : 'Tap to call or message emergency contacts'
              }
            </p>
          </motion.button>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-card-surface rounded-2xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-custom text-sm">{t('emergencyContacts')}</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{contacts.length}/5</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            className="bg-card-surface rounded-2xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-custom text-sm">Location Access</p>
                <p className={`text-lg font-semibold ${
                  locationPermission === 'granted' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {locationPermission === 'granted' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <MapPin className={`h-8 w-8 ${
                locationPermission === 'granted' ? 'text-green-500' : 'text-orange-500'
              }`} />
            </div>
          </motion.div>

          <motion.div
            className="bg-card-surface rounded-2xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-custom text-sm">Last Emergency Action</p>
                <p className="text-sm font-medium text-primary-custom">
                  {lastEmergencyAction || 'None'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>
        </div>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <motion.div
            className="bg-card-surface rounded-3xl p-12 shadow-lg border border-card-custom text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="h-16 w-16 text-secondary-custom mx-auto mb-6" />
            <h3 className="text-xl font-bold text-primary-custom mb-4">
              No emergency contacts saved
            </h3>
            <p className="text-secondary-custom mb-6 max-w-md mx-auto">
              Add trusted numbers to stay prepared for emergencies. You can save up to 5 contacts.
            </p>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Your First Contact
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                className={`bg-card-surface rounded-3xl p-6 shadow-lg border transition-all ${
                  contact.isPrimary 
                    ? 'border-yellow-300 dark:border-yellow-600 ring-2 ring-yellow-200 dark:ring-yellow-800' 
                    : 'border-card-custom'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {/* Primary Badge */}
                {contact.isPrimary && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>Primary Contact</span>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{contact.avatar}</div>
                  <h3 className="text-xl font-bold text-primary-custom mb-1">
                    {contact.name}
                  </h3>
                  <p className="text-secondary-custom text-sm mb-2">
                    {contact.relationship}
                  </p>
                  <p className="text-secondary-custom font-mono text-sm">
                    {formatPhoneNumber(contact.phone, contact.countryCode)}
                  </p>
                  <p className="text-xs text-secondary-custom mt-2">
                    Added {formatLastUpdated(contact.createdAt)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => makeEmergencyCall(contact)}
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-2 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => sendEmergencySMS(contact)}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-2 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between">
                    <motion.button
                      onClick={() => setPrimaryContact(contact.id)}
                      disabled={contact.isPrimary}
                      className={`p-2 rounded-xl transition-colors ${
                        contact.isPrimary
                          ? 'text-yellow-500 cursor-not-allowed'
                          : 'text-secondary-custom hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                      whileHover={{ scale: contact.isPrimary ? 1 : 1.1 }}
                      whileTap={{ scale: contact.isPrimary ? 1 : 0.9 }}
                    >
                      {contact.isPrimary ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                    </motion.button>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => startEditing(contact)}
                        className="p-2 text-secondary-custom hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setShowDeleteConfirm(contact.id)}
                        className="p-2 text-secondary-custom hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reminder Banner */}
        {contacts.length > 0 && (
          <motion.div
            className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Keep your emergency contacts up-to-date
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">
                  Review your emergency contacts regularly to ensure phone numbers are current and contacts are reachable. 
                  Consider adding contacts from different locations and relationships for better coverage.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add/Edit Contact Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-card-surface rounded-3xl p-8 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-primary-custom mb-6">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </h2>
                
                <div className="space-y-4">
                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Avatar
                    </label>
                    <div className="grid grid-cols-10 gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setFormData({...formData, avatar})}
                          className={`p-2 rounded-xl border-2 transition-all ${
                            formData.avatar === avatar
                              ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                              : 'border-card-custom hover:border-red-300'
                          }`}
                        >
                          <span className="text-lg">{avatar}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                      placeholder="Enter full name"
                      maxLength={50}
                    />
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Relationship *
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                      className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                    >
                      <option value="">Select relationship</option>
                      {relationshipOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Phone Number *
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                        className="px-3 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                        className="flex-1 px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                        placeholder="Phone number"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingContact(null);
                      setFormData({
                        name: '',
                        relationship: '',
                        phone: '',
                        countryCode: '+1',
                        avatar: 'bg-red-500'
                      });
                    }}
                    className="flex-1 py-3 border border-card-custom text-secondary-custom rounded-xl font-semibold hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={saveContact}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingContact ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Dialog */}
        <AnimatePresence>
          {showEmergencyDialog && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-card-surface rounded-3xl p-8 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-custom mb-2">
                    Emergency Contact
                  </h2>
                  <p className="text-secondary-custom">
                    {showTestMode ? 'Test Mode Active' : 'Choose how to contact for help'}
                  </p>
                </div>

                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border border-card-custom rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm uppercase ${contact.avatar || 'bg-red-500'}`}>
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-primary-custom flex items-center gap-1">
                              {contact.name}
                              {contact.isPrimary && <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 inline" />}
                            </p>
                            <p className="text-sm text-secondary-custom">{contact.relationship}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => makeEmergencyCall(contact)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => sendEmergencySMS(contact)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>SMS</span>
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowEmergencyDialog(false)}
                  className="w-full mt-6 py-3 text-secondary-custom hover:text-primary-custom transition-colors font-medium"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-card-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h3 className="text-lg font-bold text-primary-custom mb-4">
                  Delete Contact?
                </h3>
                <p className="text-secondary-custom mb-6">
                  Are you sure you want to delete this emergency contact? This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-2 border border-card-custom text-secondary-custom rounded-xl font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteContact(showDeleteConfirm)}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EmergencyContactsPage;