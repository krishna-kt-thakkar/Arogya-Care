import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Target, Clock, Utensils, Dumbbell, Camera, Type, Calculator, X, Calendar, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Activity, Leaf, Egg, Beef, ChefHat, GraduationCap, Briefcase, Home, User, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

interface QuizData {
  goal: 'lose' | 'gain' | 'maintain' | null;
  weightChange: number;
  duration: number;
  dietaryPreference: 'vegetarian' | 'eggitarian' | 'non-veg-chicken-mutton' | 'non-veg-all' | null;
  nonVegDays: string[];
  cuisines: string[];
  allergies: string[];
  gender: 'male' | 'female' | 'other' | null;
  region: string;
  medicalConditions: string[];
  userType: 'student' | 'professional' | 'homemaker' | null;
  currentWeight: number;
}

interface DietPlan {
  day: string;
  meals: {
    time: string;
    name: string;
    description: string;
    calories: number;
    benefits: string;
  }[];
}

interface WorkoutPlan {
  day: string;
  exercises: {
    name: string;
    duration: string;
    sets?: string;
    youtubeLink: string;
    description: string;
  }[];
}

interface CalorieEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo?: string;
  confidence?: number;
  portionSize?: 'small' | 'medium' | 'large';
}

const CUISINES = [
  'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian', 'Pakistani', 'Bangladeshi',
  'Sri Lankan', 'Nepali', 'Tibetan', 'Bhutanese', 'Indonesian', 'Malaysian', 'Filipino',
  'Singaporean', 'Burmese (Myanmar)', 'Mongolian', 'Uyghur', 'Kazakh', 'Uzbek', 'Turkmen',
  'Kyrgyz', 'Tajik', 'Afghan', 'Persian (Iranian)', 'Turkish', 'Lebanese', 'Syrian',
  'Palestinian', 'Israeli', 'Jordanian', 'Iraqi', 'Yemeni', 'Saudi Arabian', 'Omani',
  'Emirati', 'Kuwaiti', 'Qatari', 'Bahraini', 'Armenian', 'Georgian', 'Azerbaijani',
  'Moroccan', 'Algerian', 'Tunisian', 'Egyptian', 'Ethiopian', 'Eritrean', 'Somali',
  'Sudanese', 'Kenyan', 'Ugandan', 'Tanzanian', 'Rwandan', 'Ghanaian', 'Nigerian',
  'Senegalese', 'Ivorian (Côte d\'Ivoire)', 'Cameroonian', 'South African', 'Zimbabwean',
  'Malian', 'Togolese', 'Congolese', 'Mozambican', 'Malagasy (Madagascar)', 'Italian',
  'French', 'Spanish', 'Portuguese', 'German', 'British', 'Irish', 'Scottish', 'Welsh',
  'Dutch', 'Belgian', 'Swiss', 'Austrian', 'Hungarian', 'Polish', 'Czech', 'Slovak',
  'Romanian', 'Bulgarian', 'Serbian', 'Croatian', 'Bosnian', 'Slovenian', 'Albanian',
  'Greek', 'Russian', 'Ukrainian', 'Belarusian', 'Lithuanian', 'Latvian', 'Estonian',
  'Finnish', 'Swedish', 'Norwegian', 'Danish', 'Icelandic', 'American (USA)', 'Southern (USA)',
  'Cajun', 'Creole', 'Tex-Mex', 'Canadian', 'Québécois', 'Mexican', 'Guatemalan',
  'Honduran', 'Salvadoran', 'Nicaraguan', 'Costa Rican', 'Panamanian', 'Colombian',
  'Venezuelan', 'Ecuadorian', 'Peruvian', 'Bolivian', 'Chilean', 'Argentine', 'Brazilian',
  'Paraguayan', 'Uruguayan', 'Jamaican', 'Haitian', 'Cuban', 'Dominican', 'Trinidadian',
  'Barbadian', 'Puerto Rican', 'Bahamian', 'Grenadian', 'Saint Lucian', 'Australian',
  'New Zealander (Kiwi)', 'Māori', 'Samoan', 'Tongan', 'Fijian', 'Papua New Guinean',
  'Hawaiian', 'Chamorro (Guam)', 'Jewish (Ashkenazi & Sephardic)', 'Roma (Gypsy)',
  'Rastafarian (Ital)', 'Inuit'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCalorieEstimator, setShowCalorieEstimator] = useState(false);
  const [showCalorieCalendar, setShowCalorieCalendar] = useState(false);
  const [showUnrealisticGoalPopup, setShowUnrealisticGoalPopup] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    goal: null,
    weightChange: 0,
    duration: 0,
    dietaryPreference: null,
    nonVegDays: [],
    cuisines: [],
    allergies: [],
    gender: null,
    region: '',
    medicalConditions: [],
    userType: null,
    currentWeight: 70
  });

  const [cuisineSearch, setCuisineSearch] = useState('');
  const [filteredCuisines, setFilteredCuisines] = useState(CUISINES);
  const [calorieInput, setCalorieInput] = useState('');
  const [calorieResult, setCalorieResult] = useState<any>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('breakfast');
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState({
    foodName: '',
    calories: '',
    meal: 'breakfast' as 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  });

  const totalSteps = 9; // Updated to include the non-veg days question

  useEffect(() => {
    // Load saved quiz data
    const savedData = localStorage.getItem('workoutQuizData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setQuizData(parsed);
      setShowResults(true);
    }

    // Load calorie entries
    const savedEntries = localStorage.getItem('calorieEntries');
    if (savedEntries) {
      setCalorieEntries(JSON.parse(savedEntries));
    }

    // Load current weight from BMI data if available
    const bmiData = localStorage.getItem('bmiData');
    if (bmiData) {
      const parsed = JSON.parse(bmiData);
      setQuizData(prev => ({ ...prev, currentWeight: parsed.weight || 70 }));
    }
  }, []);

  useEffect(() => {
    setFilteredCuisines(
      CUISINES.filter(cuisine => 
        cuisine.toLowerCase().includes(cuisineSearch.toLowerCase())
      )
    );
  }, [cuisineSearch]);

  useEffect(() => {
    // Save calorie entries whenever they change
    localStorage.setItem('calorieEntries', JSON.stringify(calorieEntries));
  }, [calorieEntries]);

  const saveQuizData = (data: QuizData) => {
    localStorage.setItem('workoutQuizData', JSON.stringify(data));
  };

  const isGoalRealistic = (goal: string, weight: number, duration: number) => {
    if (goal === 'maintain') return true;
    const maxSafeWeightChange = duration * 2; // 2kg per month is generally safe
    return weight <= maxSafeWeightChange;
  };

  const handleNext = () => {
    if (currentStep === 1 && quizData.goal !== 'maintain') {
      // Check if goal is realistic
      if (!isGoalRealistic(quizData.goal!, quizData.weightChange, quizData.duration)) {
        setShowUnrealisticGoalPopup(true);
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete quiz
      saveQuizData(quizData);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const editPreferences = () => {
    setShowResults(false);
    setCurrentStep(0);
  };

  const handleAdjustGoal = () => {
    setShowUnrealisticGoalPopup(false);
    // Stay on the same step to allow user to adjust their inputs
  };

  const generateDietPlan = (): DietPlan[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Generate diet plans based on dietary preference and cuisine
    const isVegetarian = quizData.dietaryPreference === 'vegetarian';
    const isEggitarian = quizData.dietaryPreference === 'eggitarian';
    const primaryCuisine = quizData.cuisines[0] || 'Indian';
    
    const generateMealsForCuisine = (cuisine: string, isVeg: boolean, allowEggs: boolean) => {
      const cuisineMeals: {[key: string]: any} = {
        'Japanese': {
          breakfast: [
            { name: 'Miso Soup with Tofu', description: 'Traditional miso soup with silken tofu and wakame', calories: 120, benefits: 'Probiotics, protein' },
            { name: 'Tamagoyaki (if eggs allowed)', description: 'Japanese rolled omelette with sweet flavor', calories: 180, benefits: 'High protein, B vitamins' },
            { name: 'Rice with Nori', description: 'Steamed rice with seasoned seaweed sheets', calories: 200, benefits: 'Complex carbs, minerals' }
          ],
          lunch: [
            { name: 'Vegetable Sushi Bowl', description: 'Sushi rice with cucumber, avocado, and pickled vegetables', calories: 350, benefits: 'Healthy fats, fiber' },
            { name: 'Teriyaki Tofu', description: 'Grilled tofu with teriyaki sauce and steamed vegetables', calories: 280, benefits: 'Plant protein, antioxidants' },
            { name: 'Chicken Teriyaki (if non-veg)', description: 'Grilled chicken with teriyaki glaze and rice', calories: 420, benefits: 'Lean protein, energy' }
          ],
          dinner: [
            { name: 'Vegetable Ramen', description: 'Ramen noodles in vegetable broth with tofu and vegetables', calories: 380, benefits: 'Comfort food, nutrients' },
            { name: 'Salmon Sashimi (if non-veg)', description: 'Fresh salmon sashimi with wasabi and ginger', calories: 250, benefits: 'Omega-3, protein' }
          ]
        },
        'Chinese': {
          breakfast: [
            { name: 'Congee with Vegetables', description: 'Rice porridge with mixed vegetables and ginger', calories: 150, benefits: 'Easy digestion, warming' },
            { name: 'Steamed Buns', description: 'Vegetable-filled steamed buns', calories: 220, benefits: 'Complex carbs, fiber' }
          ],
          lunch: [
            { name: 'Mapo Tofu', description: 'Silky tofu in spicy Sichuan sauce', calories: 300, benefits: 'Protein, metabolism boost' },
            { name: 'Kung Pao Chicken (if non-veg)', description: 'Diced chicken with peanuts and vegetables', calories: 380, benefits: 'Protein, healthy fats' },
            { name: 'Vegetable Fried Rice', description: 'Wok-fried rice with mixed vegetables', calories: 320, benefits: 'Energy, vitamins' }
          ],
          dinner: [
            { name: 'Hot Pot Vegetables', description: 'Assorted vegetables cooked in flavorful broth', calories: 200, benefits: 'Low calorie, nutrients' },
            { name: 'Sweet and Sour Tofu', description: 'Crispy tofu in tangy sweet and sour sauce', calories: 280, benefits: 'Plant protein, vitamin C' }
          ]
        },
        'Indian': {
          breakfast: [
            { name: 'Poha with Peanuts', description: 'Flattened rice with roasted peanuts and curry leaves', calories: 250, benefits: 'High in carbs, good for energy' },
            { name: 'Upma with Coconut', description: 'Semolina upma with fresh coconut and curry leaves', calories: 280, benefits: 'Quick energy, healthy fats' },
            { name: 'Masala Omelette (if eggs allowed)', description: 'Spiced omelette with onions and tomatoes', calories: 200, benefits: 'High protein, B vitamins' }
          ],
          lunch: [
            { name: 'Dal Chawal with Sabzi', description: '2 chapatis, dal, mixed vegetables, cucumber salad', calories: 450, benefits: 'Complete protein, fiber rich' },
            { name: 'Rajma Rice', description: 'Kidney beans curry with brown rice and mixed vegetables', calories: 400, benefits: 'High protein, complex carbs' },
            { name: 'Chicken Curry (if non-veg)', description: 'Spiced chicken curry with rice and vegetables', calories: 480, benefits: 'Lean protein, spices' }
          ],
          dinner: [
            { name: 'Roti Sabzi', description: '3 rotis with seasonal vegetable curry and dal', calories: 420, benefits: 'Balanced nutrition, fiber' },
            { name: 'Palak Paneer', description: 'Spinach curry with cottage cheese and roti', calories: 380, benefits: 'Iron, calcium, protein' }
          ]
        }
      };

      const meals = cuisineMeals[cuisine] || cuisineMeals['Indian'];
      
      // Filter meals based on dietary preferences
      const filterMeals = (mealArray: any[]) => {
        return mealArray.filter(meal => {
          if (isVegetarian) {
            return !meal.name.toLowerCase().includes('chicken') && 
                   !meal.name.toLowerCase().includes('fish') && 
                   !meal.name.toLowerCase().includes('salmon') &&
                   !meal.name.toLowerCase().includes('egg') &&
                   !meal.name.toLowerCase().includes('omelette');
          }
          if (isEggitarian && !allowEggs) {
            return !meal.name.toLowerCase().includes('chicken') && 
                   !meal.name.toLowerCase().includes('fish') && 
                   !meal.name.toLowerCase().includes('salmon');
          }
          return true;
        });
      };

      return {
        breakfast: filterMeals(meals.breakfast),
        lunch: filterMeals(meals.lunch),
        dinner: filterMeals(meals.dinner)
      };
    };

    const cuisineMeals = generateMealsForCuisine(primaryCuisine, isVegetarian, isEggitarian);

    return days.map((day, index) => {
      // Check if this day allows non-veg/eggs based on user preferences
      const dayAllowsNonVeg = !quizData.nonVegDays.includes(day);
      const allowEggs = isEggitarian && dayAllowsNonVeg;
      const allowNonVeg = (quizData.dietaryPreference === 'non-veg-chicken-mutton' || 
                          quizData.dietaryPreference === 'non-veg-all') && dayAllowsNonVeg;

      const dayMeals = generateMealsForCuisine(primaryCuisine, isVegetarian, allowEggs);

      return {
        day,
        meals: [
          { 
            time: '7:00 AM', 
            ...dayMeals.breakfast[index % dayMeals.breakfast.length] 
          },
          { 
            time: '12:30 PM', 
            ...dayMeals.lunch[index % dayMeals.lunch.length] 
          },
          { 
            time: '4:00 PM', 
            name: 'Healthy Snack', 
            description: 'Seasonal fruits or nuts', 
            calories: 150, 
            benefits: 'Natural energy, vitamins' 
          },
          { 
            time: '8:00 PM', 
            ...dayMeals.dinner[index % dayMeals.dinner.length] 
          }
        ]
      };
    });
  };

  const generateWorkoutPlan = (): WorkoutPlan[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const workoutPlans = [
      {
        exercises: [
          { name: 'Push-ups', duration: '3 sets', sets: '10-15 reps', youtubeLink: 'https://youtube.com/watch?v=IODxDxX7oi4', description: 'Upper body strength' },
          { name: 'Squats', duration: '3 sets', sets: '15-20 reps', youtubeLink: 'https://youtube.com/watch?v=aclHkVaku9U', description: 'Lower body power' },
          { name: 'Plank', duration: '3 sets', sets: '30-60 seconds', youtubeLink: 'https://youtube.com/watch?v=ASdvN_XEl_c', description: 'Core strengthening' }
        ]
      },
      {
        exercises: [
          { name: 'Jumping Jacks', duration: '20 minutes', youtubeLink: 'https://youtube.com/watch?v=c4DAnQ6DtF8', description: 'Full body cardio' },
          { name: 'Mountain Climbers', duration: '3 sets', sets: '30 seconds', youtubeLink: 'https://youtube.com/watch?v=nmwgirgXLYM', description: 'Cardio + core' },
          { name: 'Burpees', duration: '3 sets', sets: '8-12 reps', youtubeLink: 'https://youtube.com/watch?v=auBLPXO8Fww', description: 'Full body HIIT' }
        ]
      }
    ];

    return days.map((day, index) => ({
      day,
      exercises: index === 6 ? [{ name: 'Rest Day', duration: 'Full rest', youtubeLink: '', description: 'Recovery and stretching' }] : workoutPlans[index % 2].exercises
    }));
  };

  const analyzeFood = async (photo: string, foodName?: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI food recognition
    const foodDatabase: {[key: string]: {calories: number, protein: number, carbs: number, fat: number, confidence: number}} = {
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, confidence: 0.95 },
      'roti': { calories: 80, protein: 3, carbs: 15, fat: 1, confidence: 0.92 },
      'dal': { calories: 115, protein: 9, carbs: 20, fat: 0.4, confidence: 0.88 },
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, confidence: 0.90 },
      'egg': { calories: 70, protein: 6, carbs: 0.6, fat: 5, confidence: 0.94 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, confidence: 0.96 },
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, confidence: 0.93 },
      'paneer': { calories: 265, protein: 18, carbs: 1.2, fat: 20, confidence: 0.87 },
      'dosa': { calories: 168, protein: 4, carbs: 28, fat: 4, confidence: 0.91 },
      'idli': { calories: 39, protein: 2, carbs: 8, fat: 0.3, confidence: 0.89 }
    };

    // Try to detect food from photo (mock detection)
    const detectedFoods = Object.keys(foodDatabase);
    const randomFood = detectedFoods[Math.floor(Math.random() * detectedFoods.length)];
    const nutrition = foodDatabase[randomFood];
    
    // Check if it looks like a food photo (mock validation)
    const isValidFood = Math.random() > 0.1; // 90% chance it's valid food
    
    if (!isValidFood) {
      setIsAnalyzing(false);
      return {
        error: "Please upload a valid food photo to estimate calories.",
        isFood: false
      };
    }

    const result = {
      food: foodName || randomFood.charAt(0).toUpperCase() + randomFood.slice(1),
      ...nutrition,
      portionSize: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
      tips: `${nutrition.confidence > 0.9 ? 'High confidence detection!' : 'Moderate confidence - please verify.'} Portion size estimated as ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]}.`,
      isFood: true
    };

    setIsAnalyzing(false);
    return result;
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoData = e.target?.result as string;
        setUploadedPhoto(photoData);
        
        const analysis = await analyzeFood(photoData);
        setCalorieResult(analysis);
      };
      reader.readAsDataURL(file);
    }
  };

  const estimateCalories = async () => {
    if (!calorieInput.trim()) return;
    
    const analysis = await analyzeFood('', calorieInput);
    setCalorieResult(analysis);
  };

  const addToCalendar = () => {
    if (!calorieResult || !calorieResult.isFood) return;

    const newEntry: CalorieEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      meal: selectedMeal,
      foodName: calorieResult.food,
      calories: calorieResult.calories,
      protein: calorieResult.protein,
      carbs: calorieResult.carbs,
      fat: calorieResult.fat,
      photo: uploadedPhoto || undefined,
      confidence: calorieResult.confidence,
      portionSize: calorieResult.portionSize
    };

    setCalorieEntries(prev => [...prev, newEntry]);
    
    // Reset form
    setCalorieResult(null);
    setUploadedPhoto(null);
    setCalorieInput('');
    
    // Show success message
    alert(`Added ${calorieResult.food} to ${selectedMeal}!`);
  };

  const addManualEntry = () => {
    if (!manualEntry.foodName.trim() || !manualEntry.calories) return;

    const newEntry: CalorieEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      meal: manualEntry.meal,
      foodName: manualEntry.foodName,
      calories: parseInt(manualEntry.calories),
      protein: Math.round(parseInt(manualEntry.calories) * 0.15), // Estimate
      carbs: Math.round(parseInt(manualEntry.calories) * 0.55), // Estimate
      fat: Math.round(parseInt(manualEntry.calories) * 0.30), // Estimate
    };

    setCalorieEntries(prev => [...prev, newEntry]);
    setManualEntry({ foodName: '', calories: '', meal: 'breakfast' });
    alert(`Added ${newEntry.foodName} to ${newEntry.meal}!`);
  };

  const deleteEntry = (id: string) => {
    setCalorieEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getEntriesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calorieEntries.filter(entry => entry.date === dateString);
  };

  const getTotalCaloriesForDate = (date: Date) => {
    return getEntriesForDate(date).reduce((total, entry) => total + entry.calories, 0);
  };

  const getRecommendedCalories = () => {
    // Basic calculation based on gender, goal, and weight
    const baseCalories = quizData.gender === 'male' ? 2200 : 1800;
    const weightFactor = quizData.currentWeight * 15;
    
    let goalMultiplier = 1;
    if (quizData.goal === 'lose') goalMultiplier = 0.85;
    else if (quizData.goal === 'gain') goalMultiplier = 1.15;
    
    return Math.round((baseCalories + weightFactor) * goalMultiplier);
  };

  const renderQuizStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">What's your fitness goal?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'lose', label: 'Lose Weight', icon: TrendingDown, color: 'text-red-500' },
                { value: 'gain', label: 'Gain Weight', icon: TrendingUp, color: 'text-emerald-500' },
                { value: 'maintain', label: 'Maintain Weight', icon: Activity, color: 'text-blue-500' }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setQuizData({...quizData, goal: option.value as any})}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      quizData.goal === option.value 
                        ? 'border-brand-from bg-brand-from/15 text-primary-custom shadow-md' 
                        : 'border-card-custom hover:border-brand-from/30 bg-card-surface/40 text-secondary-custom'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`h-10 w-10 mb-3 ${option.color}`} />
                    <div className="font-bold text-primary-custom">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">
              {quizData.goal === 'maintain' ? 'In how many months do you want to maintain this routine?' : 
               `How much weight do you want to ${quizData.goal}?`}
            </h2>
            {quizData.goal !== 'maintain' && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-secondary-custom uppercase mb-2 tracking-wider">Weight (kg)</label>
                <input
                  type="number"
                  value={quizData.weightChange}
                  onChange={(e) => setQuizData({...quizData, weightChange: parseInt(e.target.value) || 0})}
                  className="w-32 px-4 py-3 bg-white/5 border border-card-custom rounded-xl focus:border-brand-from outline-none text-center text-lg font-black text-primary-custom transition-all"
                  placeholder="0"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-secondary-custom uppercase mb-2 tracking-wider">Duration (months)</label>
              <input
                type="number"
                value={quizData.duration}
                onChange={(e) => setQuizData({...quizData, duration: parseInt(e.target.value) || 0})}
                className="w-32 px-4 py-3 bg-white/5 border border-card-custom rounded-xl focus:border-brand-from outline-none text-center text-lg font-black text-primary-custom transition-all"
                placeholder="0"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">What is your dietary preference?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'text-emerald-500' },
                { value: 'eggitarian', label: 'Eggitarian', icon: Egg, color: 'text-amber-500' },
                { value: 'non-veg-chicken-mutton', label: 'Non-Veg (Chicken & Mutton)', icon: Beef, color: 'text-rose-500' },
                { value: 'non-veg-all', label: 'Non-Veg (All types)', icon: ChefHat, color: 'text-red-500' }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setQuizData({...quizData, dietaryPreference: option.value as any})}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      quizData.dietaryPreference === option.value 
                        ? 'border-brand-from bg-brand-from/15 text-primary-custom shadow-md' 
                        : 'border-card-custom hover:border-brand-from/30 bg-card-surface/40 text-secondary-custom'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`h-8 w-8 mb-2 ${option.color}`} />
                    <div className="font-bold text-primary-custom">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">
              {quizData.dietaryPreference === 'eggitarian' 
                ? 'Are there particular days you don\'t eat eggs?' 
                : quizData.dietaryPreference?.includes('non-veg')
                ? 'Are there particular days you don\'t eat non-veg?'
                : 'Skip this step - not applicable for vegetarians'}
            </h2>
            
            {quizData.dietaryPreference === 'vegetarian' ? (
              <div className="text-center py-8">
                <Leaf className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <p className="text-sm text-secondary-custom">This question doesn't apply to vegetarians. Click Next to continue.</p>
              </div>
            ) : (
              <div>
                <p className="text-secondary-custom mb-6">Select the days when you prefer to avoid {quizData.dietaryPreference === 'eggitarian' ? 'eggs' : 'non-vegetarian food'}:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = quizData.nonVegDays.includes(day)
                          ? quizData.nonVegDays.filter(d => d !== day)
                          : [...quizData.nonVegDays, day];
                        setQuizData({...quizData, nonVegDays: newDays});
                      }}
                      className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                        quizData.nonVegDays.includes(day)
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-md' 
                          : 'bg-white/5 border-card-custom hover:border-brand-from/30 text-primary-custom'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setQuizData({...quizData, nonVegDays: []})}
                    className="text-sm text-secondary-custom hover:text-primary-custom underline transition-colors"
                  >
                    Clear all selections
                  </button>
                </div>
                {quizData.nonVegDays.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-sm text-orange-400">
                      You\'ll get vegetarian meals on: {quizData.nonVegDays.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">Which cuisine(s) do you prefer?</h2>
            <div className="mb-4">
              <input
                type="text"
                value={cuisineSearch}
                onChange={(e) => setCuisineSearch(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-card-custom rounded-xl focus:border-brand-from outline-none text-primary-custom transition-all"
                placeholder="Search cuisines..."
              />
            </div>
            <div className="max-h-64 overflow-y-auto border border-card-custom rounded-xl p-4 bg-white/5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCuisines.slice(0, 20).map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      const newCuisines = quizData.cuisines.includes(cuisine)
                        ? quizData.cuisines.filter(c => c !== cuisine)
                        : [...quizData.cuisines, cuisine];
                      setQuizData({...quizData, cuisines: newCuisines});
                    }}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      quizData.cuisines.includes(cuisine) 
                        ? 'bg-teal-500/10 border-teal-500/30 text-teal-500 shadow-md font-semibold' 
                        : 'bg-white/5 border-card-custom hover:border-brand-from/30 text-primary-custom'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
            {quizData.cuisines.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-secondary-custom mb-2">Selected cuisines:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quizData.cuisines.map((cuisine) => (
                    <span key={cuisine} className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-500 rounded-full text-sm font-semibold">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">Do you have any allergies?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Sesame', 'None'].map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => {
                    if (allergy === 'None') {
                      setQuizData({...quizData, allergies: []});
                    } else {
                      const newAllergies = quizData.allergies.includes(allergy)
                        ? quizData.allergies.filter(a => a !== allergy)
                        : [...quizData.allergies, allergy];
                      setQuizData({...quizData, allergies: newAllergies});
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                    (allergy === 'None' && quizData.allergies.length === 0) || quizData.allergies.includes(allergy)
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-md' 
                      : 'bg-white/5 border-card-custom hover:border-brand-from/30 text-primary-custom'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">What's your gender?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'male', label: 'Male', icon: User, color: 'text-blue-500' },
                { value: 'female', label: 'Female', icon: User, color: 'text-pink-500' },
                { value: 'other', label: 'Other', icon: User, color: 'text-purple-500' }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setQuizData({...quizData, gender: option.value as any})}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      quizData.gender === option.value 
                        ? 'border-brand-from bg-brand-from/15 text-primary-custom shadow-md' 
                        : 'border-card-custom hover:border-brand-from/30 bg-card-surface/40 text-secondary-custom'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`h-10 w-10 mb-3 ${option.color}`} />
                    <div className="font-bold text-primary-custom">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">Do you have any medical conditions?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid', 'PCOS', 'Arthritis', 'Asthma', 'None'].map((condition) => (
                <button
                  key={condition}
                  onClick={() => {
                    if (condition === 'None') {
                      setQuizData({...quizData, medicalConditions: []});
                    } else {
                      const newConditions = quizData.medicalConditions.includes(condition)
                        ? quizData.medicalConditions.filter(c => c !== condition)
                        : [...quizData.medicalConditions, condition];
                      setQuizData({...quizData, medicalConditions: newConditions});
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                    (condition === 'None' && quizData.medicalConditions.length === 0) || quizData.medicalConditions.includes(condition)
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-md' 
                      : 'bg-white/5 border-card-custom hover:border-brand-from/30 text-primary-custom'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-black text-primary-custom mb-6">What describes you best?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'student', label: 'Student', icon: GraduationCap, color: 'text-indigo-500' },
                { value: 'professional', label: 'Working Professional', icon: Briefcase, color: 'text-teal-500' },
                { value: 'homemaker', label: 'Homemaker', icon: Home, color: 'text-orange-500' }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setQuizData({...quizData, userType: option.value as any})}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      quizData.userType === option.value 
                        ? 'border-brand-from bg-brand-from/15 text-primary-custom shadow-md' 
                        : 'border-card-custom hover:border-brand-from/30 bg-card-surface/40 text-secondary-custom'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`h-10 w-10 mb-3 ${option.color}`} />
                    <div className="font-bold text-primary-custom mb-1">{option.label}</div>
                    <div className="text-xs text-secondary-custom leading-tight">{option.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    const dietPlan = generateDietPlan();
    const workoutPlan = generateWorkoutPlan();
    const targetWeight = quizData.goal === 'lose' 
      ? quizData.currentWeight - quizData.weightChange
      : quizData.goal === 'gain'
      ? quizData.currentWeight + quizData.weightChange
      : quizData.currentWeight;

    return (
      <div className="space-y-8">
        {/* Goal Summary */}
        <motion.div
          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Fitness Journey</h2>
              <p className="text-teal-100">Personalized plan based on your preferences</p>
            </div>
            <button
              onClick={editPreferences}
              className="bg-card-surface text-teal-600 px-4 py-2 rounded-xl font-semibold hover:bg-teal-50 transition-colors"
            >
              Edit Preferences
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
              <Scale className="h-6 w-6 text-teal-200 mb-2" />
              <div className="font-semibold text-teal-50">Current Weight</div>
              <div className="text-2xl font-bold text-white">{quizData.currentWeight} kg</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
              <Target className="h-6 w-6 text-teal-200 mb-2" />
              <div className="font-semibold text-teal-50">Target Weight</div>
              <div className="text-2xl font-bold text-white">{targetWeight} kg</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 flex flex-col items-start justify-center">
              <Clock className="h-6 w-6 text-teal-200 mb-2" />
              <div className="font-semibold text-teal-50">Timeline</div>
              <div className="text-2xl font-bold text-white">{quizData.duration} months</div>
            </div>
          </div>
        </motion.div>

        {/* Diet Plan */}
        <motion.div
          className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-6">
            <Utensils className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-primary-custom">{t('weeklyDietPlan')}</h2>
          </div>
          
          <div className="space-y-6">
            {dietPlan.map((day, index) => (
              <div key={day.day} className="border border-card-custom rounded-2xl p-6">
                <h3 className="text-xl font-bold text-primary-custom mb-4">{day.day}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {day.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm font-semibold text-green-800 mb-1">{meal.time}</div>
                      <div className="font-bold text-primary-custom mb-2">{meal.name}</div>
                      <div className="text-sm text-secondary-custom mb-2">{meal.description}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-600">{meal.calories} kcal</span>
                      </div>
                      <div className="text-xs text-secondary-custom mt-1">{meal.benefits}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Workout Plan */}
        <motion.div
          className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <Dumbbell className="h-8 w-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-black text-primary-custom">{t('weeklyWorkoutPlan')}</h2>
          </div>
          
          <div className="space-y-6">
            {workoutPlan.map((day, index) => (
              <div key={day.day} className="border border-card-custom rounded-2xl p-6">
                <h3 className="text-xl font-bold text-primary-custom mb-4">{day.day}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="bg-orange-50 rounded-xl p-4">
                      <div className="font-bold text-primary-custom mb-2">{exercise.name}</div>
                      <div className="text-sm text-secondary-custom mb-2">{exercise.description}</div>
                      <div className="text-sm font-semibold text-orange-600 mb-2">{exercise.duration}</div>
                      {exercise.sets && (
                        <div className="text-sm text-secondary-custom mb-2">{exercise.sets}</div>
                      )}
                      {exercise.youtubeLink && (
                        <a
                          href={exercise.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          {t('watchVideo')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderCalorieEstimator = () => (
    <motion.div
      className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
          <h2 className="text-2xl font-bold text-primary-custom">{t('calorieEstimator')}</h2>
        </div>
        <button
          onClick={() => setShowCalorieEstimator(false)}
          className="text-secondary-custom hover:text-secondary-custom"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Upload Food Photo</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-card-custom rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 text-secondary-custom mx-auto mb-4" />
              <p className="text-secondary-custom mb-4">Take a photo or upload image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors cursor-pointer inline-block"
              >
                Choose Photo
              </label>
            </div>
            
            {uploadedPhoto && (
              <div className="border border-card-custom rounded-xl p-4">
                <img src={uploadedPhoto} alt="Uploaded food" className="w-full h-48 object-cover rounded-lg mb-4" />
                <p className="text-sm text-secondary-custom text-center">Photo uploaded successfully!</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Type Food Name</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Type className="h-5 w-5 text-secondary-custom" />
              <input
                type="text"
                value={calorieInput}
                onChange={(e) => setCalorieInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-card-custom dark:text-white rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent"
                placeholder="e.g., rice, chicken, apple..."
              />
            </div>
            <button
              onClick={estimateCalories}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Estimate Calories'}
            </button>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-secondary-custom">AI is analyzing your food...</p>
        </div>
      )}

      {calorieResult && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {calorieResult.error ? (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 text-center">
              <div className="text-red-500 font-bold text-lg mb-2">Notice</div>
              <p className="text-red-800 dark:text-red-200 font-semibold">{calorieResult.error}</p>
              <p className="text-red-600 dark:text-red-400 mt-2">Please try uploading a clearer food photo or use the text input.</p>
            </div>
          ) : (
            <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">Nutrition Analysis: {calorieResult.food}</h3>
                {calorieResult.confidence && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    calorieResult.confidence > 0.9 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {Math.round(calorieResult.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{calorieResult.calories}</div>
                  <div className="text-sm text-secondary-custom">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calorieResult.protein}g</div>
                  <div className="text-sm text-secondary-custom">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{calorieResult.carbs}g</div>
                  <div className="text-sm text-secondary-custom">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{calorieResult.fat}g</div>
                  <div className="text-sm text-secondary-custom">Fat</div>
                </div>
              </div>
              
              {calorieResult.portionSize && (
                <div className="mb-4 text-center">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-semibold">
                    Portion: {calorieResult.portionSize}
                  </span>
                </div>
              )}
              
              <div className="bg-card-surface rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-primary-custom mb-2">Analysis Notes:</h4>
                <p className="text-secondary-custom">{calorieResult.tips}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-custom mb-2">Add to meal:</label>
                  <select
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value as any)}
                    className="w-full px-4 py-2 border border-card-custom dark:text-white rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <button
                  onClick={addToCalendar}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Add to Calendar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Manual Entry Section */}
      <div className="mt-8 p-6 bg-white/5/50 rounded-2xl border border-card-custom">
        <h3 className="text-lg font-semibold text-primary-custom mb-4">Manual Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={manualEntry.foodName}
            onChange={(e) => setManualEntry({...manualEntry, foodName: e.target.value})}
            className="px-4 py-2 border border-card-custom dark:text-white rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Food name"
          />
          <input
            type="number"
            value={manualEntry.calories}
            onChange={(e) => setManualEntry({...manualEntry, calories: e.target.value})}
            className="px-4 py-2 border border-card-custom dark:text-white rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Calories"
          />
          <select
            value={manualEntry.meal}
            onChange={(e) => setManualEntry({...manualEntry, meal: e.target.value as any})}
            className="px-4 py-2 border border-card-custom dark:text-white rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <button
          onClick={addManualEntry}
          className="mt-4 w-full bg-white/15 text-white py-2 rounded-xl font-semibold hover:bg-white/20 transition-colors"
        >
          Add Manual Entry
        </button>
      </div>
    </motion.div>
  );

  const renderCalorieCalendar = () => {
    const weekDates = getWeekDates(currentWeek);
    const recommendedCalories = getRecommendedCalories();

    return (
      <motion.div
        className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-primary-custom">{t('calorieCalendar')}</h2>
          </div>
          <button
            onClick={() => setShowCalorieCalendar(false)}
            className="text-secondary-custom hover:text-secondary-custom"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-secondary-custom" />
          </button>
          <h3 className="text-lg font-semibold text-primary-custom">
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-secondary-custom" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-semibold text-secondary-custom py-2">
              {day}
            </div>
          ))}
          
          {weekDates.map((date, index) => {
            const dayEntries = getEntriesForDate(date);
            const totalCalories = getTotalCaloriesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`border rounded-xl p-3 min-h-[120px] ${
                  isToday ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20' : 'border-card-custom bg-card-surface'
                }`}
              >
                <div className="text-center mb-2">
                  <div className={`text-lg font-semibold ${isToday ? 'text-indigo-600' : 'text-primary-custom'}`}>
                    {date.getDate()}
                  </div>
                  {totalCalories > 0 && (
                    <div className="text-xs text-secondary-custom">
                      {totalCalories} / {recommendedCalories} kcal
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => {
                    const mealEntries = dayEntries.filter(entry => entry.meal === meal);
                    const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);
                    const mealCode = meal === 'breakfast' ? 'B' : meal === 'lunch' ? 'L' : meal === 'snacks' ? 'S' : 'D';
                    
                    return (
                      <div key={meal} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-secondary-custom mr-1">{mealCode}</span>
                        <span className={mealCalories > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-secondary-custom'}>
                          {mealCalories || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {totalCalories > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          totalCalories > recommendedCalories ? 'bg-red-450' : 'bg-green-450'
                        }`}
                        style={{ width: `${Math.min((totalCalories / recommendedCalories) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Today's Detailed View */}
        <div className="border-t border-card-custom pt-6">
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Today's Meals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => {
              const todayEntries = getEntriesForDate(new Date()).filter(entry => entry.meal === meal);
              
              return (
                <div key={meal} className="bg-white/5/40 rounded-xl p-4">
                  <h4 className="font-semibold text-primary-custom mb-3 capitalize">
                    {meal}
                  </h4>
                  <div className="space-y-2">
                    {todayEntries.length > 0 ? (
                      todayEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between bg-card-surface rounded-lg p-2 border border-gray-150">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-primary-custom">{entry.foodName}</div>
                            <div className="text-xs text-secondary-custom">{entry.calories} kcal</div>
                          </div>
                          {entry.photo && (
                            <img src={entry.photo} alt={entry.foodName} className="w-8 h-8 rounded object-cover mr-2" />
                          )}
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary-custom text-sm text-center py-4">
                        No meals logged
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getTotalCaloriesForDate(new Date())}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Today's Calories</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{recommendedCalories}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Recommended</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${
              getTotalCaloriesForDate(new Date()) > recommendedCalories ? 'text-red-600' : 'text-purple-600'
            }`}>
              {getTotalCaloriesForDate(new Date()) - recommendedCalories > 0 ? '+' : ''}{getTotalCaloriesForDate(new Date()) - recommendedCalories}
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Surplus/Deficit</div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Unrealistic Goal Pop-up
  const renderUnrealisticGoalPopup = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card-surface rounded-3xl p-8 w-full max-w-md text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <Clock className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary-custom mb-4">
          We truly appreciate your motivation and energy!
        </h2>
        <p className="text-secondary-custom mb-6 leading-relaxed">
          But to keep you safe and healthy, we recommend setting a more realistic goal.
          It's better to grow slowly and sustainably than burn out quickly.
        </p>
        
        <motion.button
          onClick={handleAdjustGoal}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Adjust Goal
        </motion.button>
      </motion.div>
    </motion.div>
  );

  if (showCalorieCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setShowCalorieCalendar(false)}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-custom">{t('calorieCalendar')}</h1>
              <p className="text-secondary-custom mt-1">Track your daily calorie intake and meal history</p>
            </div>
          </motion.div>
          {renderCalorieCalendar()}
        </main>
      </div>
    );
  }

  if (showCalorieEstimator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setShowCalorieEstimator(false)}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-custom">{t('calorieEstimator')}</h1>
              <p className="text-secondary-custom mt-1">Estimate calories and nutrition in your food using AI</p>
            </div>
          </motion.div>
          {renderCalorieEstimator()}
        </main>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="h-6 w-6 text-secondary-custom" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-primary-custom">{t('workoutDietPlans')}</h1>
                <p className="text-secondary-custom mt-1">Your personalized fitness and nutrition plan</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCalorieEstimator(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Calorie Estimator</span>
              </button>
              <button
                onClick={() => setShowCalorieCalendar(true)}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>{t('calorieCalendar')}</span>
              </button>
            </div>
          </motion.div>
          {renderResults()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary-custom">{t('workoutDietPlans')}</h1>
              <p className="text-secondary-custom mt-1">Get your personalized fitness and nutrition plan</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-secondary-custom mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Quiz Content */}
        <motion.div
          className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStep}
        >
          {renderQuizStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 0 
                ? 'bg-white/5 text-secondary-custom cursor-not-allowed' 
                : 'bg-white/10 text-secondary-custom hover:bg-white/20'
            }`}
            whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
            whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={
              (currentStep === 0 && !quizData.goal) ||
              (currentStep === 1 && (!quizData.duration || (quizData.goal !== 'maintain' && !quizData.weightChange))) ||
              (currentStep === 2 && !quizData.dietaryPreference) ||
              (currentStep === 4 && quizData.cuisines.length === 0) ||
              (currentStep === 6 && !quizData.gender) ||
              (currentStep === 8 && !quizData.userType)
            }
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
              (currentStep === 0 && !quizData.goal) ||
              (currentStep === 1 && (!quizData.duration || (quizData.goal !== 'maintain' && !quizData.weightChange))) ||
              (currentStep === 2 && !quizData.dietaryPreference) ||
              (currentStep === 4 && quizData.cuisines.length === 0) ||
              (currentStep === 6 && !quizData.gender) ||
              (currentStep === 8 && !quizData.userType)
                ? 'bg-white/20 text-secondary-custom cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{currentStep === totalSteps - 1 ? 'Generate Plan' : 'Next'}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Unrealistic Goal Pop-up */}
        {showUnrealisticGoalPopup && renderUnrealisticGoalPopup()}
      </main>
    </div>
  );
};

export default WorkoutPage;