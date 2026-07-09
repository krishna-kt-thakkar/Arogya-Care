import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pill, Plus, Clock, Bell, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useStreak } from '../contexts/StreakContext';
import Header from '../components/layout/Header';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  color: string;
  lastUpdated: string;
}

const MedicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addActivity } = useStreak();
  const [showAddForm, setShowAddForm] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time: '08:00'
  });

  // Load saved data on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('medications_data');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      // Check if data is from today
      if (data.date === today) {
        setMedications(data.medications);
      } else {
        // New day, reset taken status but keep medications
        const resetMedications = data.medications.map((med: Medication) => ({
          ...med,
          taken: false,
          lastUpdated: new Date().toISOString()
        }));
        const newData = {
          date: today,
          medications: resetMedications,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('medications_data', JSON.stringify(newData));
        setMedications(resetMedications);
      }
    } else {
      // Initialize with default medications
      const defaultMedications = [
        {
          id: '1',
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Once daily',
          time: '08:00',
          taken: false,
          color: 'bg-yellow-100 text-yellow-800',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Omega-3',
          dosage: '500mg',
          frequency: 'Twice daily',
          time: '12:00',
          taken: false,
          color: 'bg-blue-100 text-blue-800',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Multivitamin',
          dosage: '1 tablet',
          frequency: 'Once daily',
          time: '20:00',
          taken: false,
          color: 'bg-green-100 text-green-800',
          lastUpdated: new Date().toISOString()
        }
      ];
      
      const newData = {
        date: today,
        medications: defaultMedications,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('medications_data', JSON.stringify(newData));
      setMedications(defaultMedications);
    }
  }, []);

  // Save medications data
  const saveMedicationsData = (updatedMedications: Medication[]) => {
    const today = new Date().toISOString().split('T')[0];
    const data = {
      date: today,
      medications: updatedMedications,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('medications_data', JSON.stringify(data));
    setMedications(updatedMedications);
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
  };

  const toggleMedication = (id: string) => {
    const updatedMedications = medications.map(med => {
      if (med.id === id) {
        const updatedMed = { 
          ...med, 
          taken: !med.taken,
          lastUpdated: new Date().toISOString()
        };
        // Track activity for streak when marking as taken
        if (updatedMed.taken) {
          addActivity('medication_taken');
        }
        return updatedMed;
      }
      return med;
    });
    
    saveMedicationsData(updatedMedications);
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      const colors = [
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-indigo-100 text-indigo-800',
        'bg-red-100 text-red-800'
      ];
      
      const medication: Medication = {
        id: Date.now().toString(),
        ...newMedication,
        taken: false,
        color: colors[Math.floor(Math.random() * colors.length)],
        lastUpdated: new Date().toISOString()
      };
      
      const updatedMedications = [...medications, medication];
      saveMedicationsData(updatedMedications);
      
      setNewMedication({ name: '', dosage: '', frequency: 'Once daily', time: '08:00' });
      setShowAddForm(false);
    }
  };

  const deleteMedication = (id: string) => {
    const updatedMedications = medications.filter(med => med.id !== id);
    saveMedicationsData(updatedMedications);
  };

  const takenCount = medications.filter(med => med.taken).length;
  const totalCount = medications.length;

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
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
            ✓ Medications data saved
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
              className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('medicationReminder')} 💊</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Never miss your medications</p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>Add Medication</span>
          </motion.button>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Today's Progress</h2>
              <p className="text-gray-600 dark:text-gray-300">Keep up the great work!</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{takenCount}/{totalCount}</p>
              <p className="text-gray-600 dark:text-gray-300">Medications taken</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 transition-colors duration-300">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: totalCount > 0 ? `${(takenCount / totalCount) * 100}%` : '0%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Medications List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((medication, index) => (
            <motion.div
              key={medication.id}
              className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
                medication.taken ? 'opacity-75' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${medication.color} dark:bg-opacity-20`}>
                  <Pill className="h-6 w-6" />
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteMedication(medication.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{medication.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">{medication.dosage}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{medication.frequency}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{medication.time}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Reminder on</span>
                </div>
              </div>

              {medication.lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Updated {formatLastUpdated(medication.lastUpdated)}
                </p>
              )}

              <motion.button
                onClick={() => toggleMedication(medication.id)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  medication.taken
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {medication.taken ? '✓ Taken' : 'Mark as Taken'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Add Medication Modal */}
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md transition-colors duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Medication</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter medication name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., 500mg, 1 tablet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMedication}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Add Medication
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MedicationsPage;