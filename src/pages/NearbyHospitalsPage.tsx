import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation, 
  RefreshCw, 
  Guitar as Hospital, 
  Star, 
  Clock, 
  AlertCircle, 
  Loader, 
  Wifi, 
  WifiOff,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useLanguage } from '../hooks/useLanguage';


interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  distance?: number;
  lat: number;
  lng: number;
  type: string;
  opening_hours?: string;
  emergency_services?: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const NearbyHospitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State management
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [filterType, setFilterType] = useState<'all' | 'emergency' | 'general'>('all');
  const [activeProvider, setActiveProvider] = useState<'overpass' | 'nominatim' | 'mock'>('overpass');

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get user location
  const getUserLocation = useCallback(() => {
    return new Promise<UserLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to a default location (New Delhi, India)
          const fallbackLocation = { lat: 28.6139, lng: 77.2090 };
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Option 1: OpenStreetMap Overpass API (Free, No API Key Required)
  const searchHospitalsOverpass = useCallback(async (location: UserLocation) => {
    const bbox = {
      south: location.lat - 0.1,
      west: location.lng - 0.1,
      north: location.lat + 0.1,
      east: location.lng + 0.1
    };

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="hospital"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="hospital"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        node["amenity"="clinic"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="clinic"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenStreetMap');
    }

    const data = await response.json();
    
    return data.elements.map((element: any) => {
      const lat = element.lat || element.center?.lat || 0;
      const lng = element.lon || element.center?.lon || 0;
      
      return {
        id: element.id.toString(),
        name: element.tags?.name || 'Unnamed Hospital',
        address: [
          element.tags?.['addr:street'],
          element.tags?.['addr:city'],
          element.tags?.['addr:postcode']
        ].filter(Boolean).join(', ') || 'Address not available',
        phone: element.tags?.phone,
        website: element.tags?.website,
        lat,
        lng,
        type: element.tags?.amenity || 'hospital',
        opening_hours: element.tags?.opening_hours,
        emergency_services: element.tags?.emergency === 'yes',
        distance: calculateDistance(location.lat, location.lng, lat, lng)
      } as Hospital;
    }).filter((hospital: Hospital) => 
      hospital.distance! <= searchRadius && hospital.name !== 'Unnamed Hospital'
    ).sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0));
  }, [searchRadius]);

  // Option 2: Nominatim API (Free, No API Key Required)
  const searchHospitalsNominatim = useCallback(async (location: UserLocation) => {
    const queries = ['hospital', 'clinic', 'medical center'];
    const allResults: Hospital[] = [];

    for (const query of queries) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&lat=${location.lat}&lon=${location.lng}&radius=${searchRadius * 1000}&limit=20&addressdetails=1`
      );

      if (!response.ok) continue;

      const data = await response.json();
      
      const hospitals = data.map((place: any) => ({
        id: place.place_id.toString(),
        name: place.display_name.split(',')[0],
        address: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        type: place.type,
        distance: calculateDistance(
          location.lat, 
          location.lng, 
          parseFloat(place.lat), 
          parseFloat(place.lon)
        )
      } as Hospital));

      allResults.push(...hospitals);
    }

    // Remove duplicates and sort by distance
    const uniqueHospitals = allResults.filter((hospital, index, self) => 
      index === self.findIndex(h => h.name === hospital.name)
    );

    return uniqueHospitals
      .filter(hospital => hospital.distance! <= searchRadius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 20);
  }, [searchRadius]);

  // Option 3: Mock Data (Fallback)
  const getMockHospitals = useCallback((location: UserLocation) => {
    const mockHospitals: Hospital[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Main Street, Downtown',
        phone: '+1-555-0123',
        website: 'https://citygeneral.com',
        rating: 4.2,
        lat: location.lat + 0.01,
        lng: location.lng + 0.01,
        type: 'hospital',
        opening_hours: '24/7',
        emergency_services: true,
        distance: calculateDistance(location.lat, location.lng, location.lat + 0.01, location.lng + 0.01)
      },
      {
        id: '2',
        name: 'Metro Medical Center',
        address: '456 Health Avenue, Medical District',
        phone: '+1-555-0456',
        rating: 4.5,
        lat: location.lat - 0.015,
        lng: location.lng + 0.02,
        type: 'hospital',
        opening_hours: '6:00 AM - 10:00 PM',
        emergency_services: false,
        distance: calculateDistance(location.lat, location.lng, location.lat - 0.015, location.lng + 0.02)
      },
      {
        id: '3',
        name: 'Community Health Clinic',
        address: '789 Care Street, Suburb',
        phone: '+1-555-0789',
        rating: 4.0,
        lat: location.lat + 0.02,
        lng: location.lng - 0.01,
        type: 'clinic',
        opening_hours: '8:00 AM - 6:00 PM',
        emergency_services: false,
        distance: calculateDistance(location.lat, location.lng, location.lat + 0.02, location.lng - 0.01)
      },
      {
        id: '4',
        name: 'Emergency Medical Services',
        address: '321 Urgent Care Blvd, Central',
        phone: '+1-555-0321',
        rating: 4.3,
        lat: location.lat - 0.005,
        lng: location.lng - 0.015,
        type: 'hospital',
        opening_hours: '24/7',
        emergency_services: true,
        distance: calculateDistance(location.lat, location.lng, location.lat - 0.005, location.lng - 0.015)
      },
      {
        id: '5',
        name: 'Specialized Treatment Center',
        address: '654 Specialist Drive, Medical Park',
        phone: '+1-555-0654',
        rating: 4.7,
        lat: location.lat + 0.025,
        lng: location.lng + 0.005,
        type: 'clinic',
        opening_hours: '7:00 AM - 9:00 PM',
        emergency_services: false,
        distance: calculateDistance(location.lat, location.lng, location.lat + 0.025, location.lng + 0.005)
      }
    ];

    return mockHospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, []);

  // Search for nearby hospitals using selected provider
  const searchNearbyHospitals = useCallback(async (location: UserLocation) => {
    try {
      switch (activeProvider) {
        case 'overpass':
          return await searchHospitalsOverpass(location);
        case 'nominatim':
          return await searchHospitalsNominatim(location);
        case 'mock':
        default:
          return getMockHospitals(location);
      }
    } catch (error) {
      console.error(`Error with ${activeProvider} provider:`, error);
      // Fallback to mock data
      return getMockHospitals(location);
    }
  }, [activeProvider, searchHospitalsOverpass, searchHospitalsNominatim, getMockHospitals]);

  // Load hospitals data
  const loadHospitals = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      // Get user location
      const location = await getUserLocation();
      setUserLocation(location);

      // Search for hospitals
      const hospitalResults = await searchNearbyHospitals(location);
      
      // Apply filters
      const filteredHospitals = hospitalResults.filter(hospital => {
        if (filterType === 'emergency') return hospital.emergency_services;
        if (filterType === 'general') return !hospital.emergency_services;
        return true;
      });

      setHospitals(filteredHospitals);

      // Cache results
      localStorage.setItem('cached_hospitals', JSON.stringify({
        hospitals: filteredHospitals,
        location,
        timestamp: Date.now(),
        provider: activeProvider
      }));

      // Show success toast
      setShowToast(`Found ${filteredHospitals.length} hospitals using ${activeProvider.toUpperCase()}`);
      setTimeout(() => setShowToast(''), 3000);

    } catch (err) {
      console.error('Error loading hospitals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load hospitals';
      setError(errorMessage);
      
      // Try to load cached data
      const cachedData = localStorage.getItem('cached_hospitals');
      if (cachedData) {
        try {
          const cached = JSON.parse(cachedData);
          const cacheAge = Date.now() - (cached.timestamp || 0);
          const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (cacheAge < maxCacheAge && cached.hospitals && cached.hospitals.length > 0) {
            setHospitals(cached.hospitals);
            setUserLocation(cached.location || null);
            setShowToast('Showing cached hospital data');
            setTimeout(() => setShowToast(''), 3000);
            setError('');
          }
        } catch (cacheError) {
          console.error('Error loading cached data:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getUserLocation, searchNearbyHospitals, activeProvider, filterType]);

  // Initialize on mount
  useEffect(() => {
    if (isOnline) {
      loadHospitals();
    }
  }, [isOnline, loadHospitals]);

  // Handle hospital click
  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  // Handle phone call
  const handleCall = (hospital: Hospital) => {
    if (hospital.phone) {
      window.open(`tel:${hospital.phone}`, '_self');
    } else {
      setShowToast('Phone number not available');
      setTimeout(() => setShowToast(''), 3000);
    }
  };

  // Handle directions
  const handleDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  // Handle website visit
  const handleWebsite = (hospital: Hospital) => {
    if (hospital.website) {
      window.open(hospital.website, '_blank');
    } else {
      setShowToast('Website not available');
      setTimeout(() => setShowToast(''), 3000);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    if (isOnline) {
      loadHospitals(true);
    } else {
      setShowToast('No internet connection');
      setTimeout(() => setShowToast(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              className="fixed top-4 right-4 bg-card-surface border border-card-custom rounded-xl px-4 py-3 shadow-lg z-50"
              initial={{ opacity: 0, scale: 0, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 100 }}
            >
              <p className="text-sm font-medium text-primary-custom">{showToast}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
              <h1 className="text-3xl font-bold text-primary-custom">{t('nearbyServices')}</h1>
              <p className="text-secondary-custom mt-1">Find healthcare services near you</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-1">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {hospitals.length > 0 && (
                  <span className="text-xs text-secondary-custom">
                    {hospitals.length} hospitals found
                  </span>
                )}
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Using {activeProvider.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing || !isOnline}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </motion.button>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="mb-8 bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-2">
                Data Provider
              </label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as any)}
                className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
              >
                <option value="overpass">OpenStreetMap (Detailed)</option>
                <option value="nominatim">Nominatim (Fast)</option>
                <option value="mock">Demo Data</option>
              </select>
            </div>

            {/* Search Radius */}
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-2">
                Search Radius: {searchRadius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-2">
                Filter
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
              >
                <option value="all">All Hospitals</option>
                <option value="emergency">Emergency Only</option>
                <option value="general">General Care</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Unable to load hospitals</h3>
                <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
                {!isOnline && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    Please check your internet connection and try again.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader className="h-12 w-12 text-red-500 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-semibold text-primary-custom mb-2">
                Finding nearby hospitals...
              </h3>
              <p className="text-secondary-custom">
                Using {activeProvider.toUpperCase()} to search for healthcare services
              </p>
            </div>
          </motion.div>
        )}

        {/* Hospitals List */}
        {!isLoading && hospitals.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                className={`bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                  selectedHospital?.id === hospital.id ? 'ring-2 ring-red-500' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleHospitalClick(hospital)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-custom text-lg mb-2">
                      {hospital.name}
                    </h3>
                    <p className="text-secondary-custom text-sm mb-2">
                      {hospital.address}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      {hospital.distance && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-secondary-custom" />
                          <span className="text-sm text-secondary-custom">
                            {hospital.distance.toFixed(1)} km
                          </span>
                        </div>
                      )}
                      
                      {hospital.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-secondary-custom">
                            {hospital.rating}
                          </span>
                        </div>
                      )}
                      
                      {hospital.emergency_services && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                          Emergency
                        </span>
                      )}
                    </div>

                    {hospital.opening_hours && (
                      <div className="flex items-center space-x-1 mb-3">
                        <Clock className="h-4 w-4 text-secondary-custom" />
                        <span className="text-sm text-secondary-custom">
                          {hospital.opening_hours}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {hospital.phone && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(hospital);
                          }}
                          className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Phone className="h-3 w-3" />
                          <span>Call</span>
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(hospital);
                        }}
                        className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Directions</span>
                      </motion.button>

                      {hospital.website && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWebsite(hospital);
                          }}
                          className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Website</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <Hospital className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && hospitals.length === 0 && !error && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Hospital className="h-16 w-16 text-secondary-custom mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-custom mb-2">
              No hospitals found nearby
            </h3>
            <p className="text-secondary-custom mb-6">
              Try increasing the search radius or changing the data provider.
            </p>
            <motion.button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Provider Information */}
        {hospitals.length > 0 && (
          <motion.div
            className="mt-8 bg-card-surface rounded-2xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-primary-custom mb-4">Data Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">OpenStreetMap Overpass</h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Free, detailed hospital data from OpenStreetMap. Most comprehensive but may be slower.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Nominatim</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Fast geocoding service. Good for quick searches but less detailed information.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Demo Data</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Sample hospital data for testing. Always available offline.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default NearbyHospitalsPage;