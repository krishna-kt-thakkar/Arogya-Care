import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  FileText, 
  Brain, 
  Heart, 
  Pill, 
  Activity, 
  Globe, 
  Download, 
  Trash2, 
  Edit3, 
  Save, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Sparkles, 
  Shield, 
  Languages,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  MessageCircle,
  Share,
  Mail,
  Bell,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

interface MedicalReport {
  id: string;
  name: string;
  type: 'blood_test' | 'prescription' | 'scan' | 'discharge' | 'other';
  uploadDate: string;
  imageUrl: string;
  extractedData: {
    rawText: string;
    structuredData: any;
  };
  aiAnalysis: {
    summary: string;
    testResults: Array<{
      test: string;
      value: string;
      normalRange: string;
      status: 'normal' | 'high' | 'low' | 'critical';
      explanation: string;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      purpose: string;
      instructions: string;
    }>;
    nextSteps: string[];
    concerns: string[];
  };
  translations: { [language: string]: any };
  isLocked: boolean;
  tags: string[];
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const ReportDecoderPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'EN'
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'reports' | 'analysis'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPrivacyMode, setShowPrivacyMode] = useState(false);
  const [editingReportName, setEditingReportName] = useState<string | null>(null);
  const [newReportName, setNewReportName] = useState('');
  const [analysisTab, setAnalysisTab] = useState<'summary' | 'medications' | 'next-steps'>('summary');

  // Supported languages
  const supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'AR' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: 'ZH' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BN' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'TA' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: 'TE' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: 'UR' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JA' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KO' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'PL' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'SV' }
  ];

  // Load reports from localStorage
  React.useEffect(() => {
    const savedReports = localStorage.getItem('medical_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  // Save reports to localStorage
  const saveReports = (newReports: MedicalReport[]) => {
    setReports(newReports);
    localStorage.setItem('medical_reports', JSON.stringify(newReports));
  };

  // Enhanced OCR simulation with realistic text extraction
  const performOCR = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setOcrProgress(0);
      
      // Simulate OCR processing with progress updates
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      setTimeout(() => {
        clearInterval(progressInterval);
        setOcrProgress(100);
        
        // Simulate different types of medical reports based on file name or random selection
        const reportTypes = [
          {
            type: 'blood_test',
            text: `COMPREHENSIVE METABOLIC PANEL
Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Lab ID: LAB123456

GLUCOSE, FASTING: 95 mg/dL (Normal: 70-100)
HEMOGLOBIN A1C: 5.4% (Normal: <5.7%)
TOTAL CHOLESTEROL: 210 mg/dL (Normal: <200)
HDL CHOLESTEROL: 45 mg/dL (Normal: >40)
LDL CHOLESTEROL: 140 mg/dL (Normal: <100)
TRIGLYCERIDES: 125 mg/dL (Normal: <150)
HEMOGLOBIN: 11.2 g/dL (Normal: 12.0-15.5)
WHITE BLOOD CELLS: 7,200 cells/μL (Normal: 4,000-11,000)
RED BLOOD CELLS: 4.2 million cells/μL (Normal: 4.2-5.4)
PLATELETS: 250,000 cells/μL (Normal: 150,000-450,000)
CREATININE: 1.0 mg/dL (Normal: 0.6-1.2)
BUN: 15 mg/dL (Normal: 7-20)
SODIUM: 140 mEq/L (Normal: 136-145)
POTASSIUM: 4.0 mEq/L (Normal: 3.5-5.0)

MEDICATIONS PRESCRIBED:
- Iron Supplement 65mg daily
- Multivitamin 1 tablet daily
- Atorvastatin 20mg daily for cholesterol

DOCTOR NOTES:
Mild anemia detected. Recommend iron supplementation and dietary changes.
Cholesterol slightly elevated - lifestyle modifications recommended.
Follow-up in 3 months.`
          },
          {
            type: 'prescription',
            text: `PRESCRIPTION
Dr. Sarah Johnson, MD
Internal Medicine
Date: ${new Date().toLocaleDateString()}

Patient: Jane Smith
DOB: 01/15/1985

Rx:
1. Metformin 500mg - Take twice daily with meals for diabetes management
2. Lisinopril 10mg - Take once daily for blood pressure control
3. Vitamin D3 1000 IU - Take once daily for bone health
4. Omega-3 Fish Oil 1000mg - Take twice daily for heart health

Instructions:
- Take medications as prescribed
- Monitor blood sugar levels daily
- Follow up in 4 weeks
- Call if experiencing any side effects

Refills: 3 months supply
Next appointment: Follow-up required`
          },
          {
            type: 'scan',
            text: `CHEST X-RAY REPORT
Patient: Michael Brown
Date: ${new Date().toLocaleDateString()}
Study: Chest PA and Lateral

FINDINGS:
- Heart size is normal
- Lungs are clear bilaterally
- No acute cardiopulmonary abnormalities
- Diaphragms are intact
- Bone structures appear normal

IMPRESSION:
Normal chest X-ray
No evidence of pneumonia or other acute findings

RECOMMENDATIONS:
- No immediate follow-up required
- Continue current treatment plan
- Return if symptoms worsen`
          }
        ];

        const randomReport = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        
        // Check if OCR should "fail" (10% chance for demonstration)
        if (Math.random() < 0.1) {
          reject(new Error("Could not extract clear text from this image. Please try uploading a clearer photo with better lighting."));
          return;
        }
        
        resolve(randomReport.text);
      }, 3000); // 3 second OCR simulation
    });
  };

  // Enhanced AI analysis with realistic medical interpretation
  const performAIAnalysis = async (extractedText: string): Promise<any> => {
    return new Promise((resolve) => {
      setAnalysisProgress(0);
      
      // Simulate AI analysis with progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 12;
        });
      }, 300);

      setTimeout(() => {
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        
        // Analyze the extracted text and generate appropriate response
        let analysis;
        
        if (extractedText.includes('GLUCOSE') || extractedText.includes('HEMOGLOBIN') || extractedText.includes('CHOLESTEROL')) {
          // Blood test analysis
          analysis = {
            summary: "Your blood test results show mostly normal values with a few areas that need attention. Overall, your health indicators are within acceptable ranges, but there are some areas we should monitor and improve together.",
            testResults: [
              {
                test: "Hemoglobin",
                value: "11.2 g/dL",
                normalRange: "12.0-15.5 g/dL",
                status: "low" as const,
                explanation: "Your hemoglobin is slightly below normal. This could indicate mild anemia, often caused by iron deficiency. Don't worry - this is very common and treatable! Consider eating more iron-rich foods like spinach, lentils, and lean meats."
              },
              {
                test: "White Blood Cell Count",
                value: "7,200 cells/μL",
                normalRange: "4,000-11,000 cells/μL",
                status: "normal" as const,
                explanation: "Your white blood cell count is perfectly normal! This shows your immune system is healthy and ready to fight off infections. Great job taking care of yourself!"
              },
              {
                test: "Blood Sugar (Fasting)",
                value: "95 mg/dL",
                normalRange: "70-100 mg/dL",
                status: "normal" as const,
                explanation: "Your fasting blood sugar is excellent! This shows good metabolic health and indicates a very low risk of diabetes. Keep up the healthy lifestyle!"
              },
              {
                test: "Total Cholesterol",
                value: "210 mg/dL",
                normalRange: "< 200 mg/dL",
                status: "high" as const,
                explanation: "Your cholesterol is slightly elevated, but don't panic! This is manageable with some lifestyle changes. Consider reducing saturated fats, increasing fiber intake, and adding some light exercise like walking."
              }
            ],
            medications: [
              {
                name: "Iron Supplement",
                dosage: "65mg daily",
                purpose: "To increase iron levels and improve hemoglobin count",
                instructions: "Take with vitamin C (like orange juice) for better absorption. Avoid taking with tea or coffee as they can reduce absorption."
              },
              {
                name: "Multivitamin",
                dosage: "1 tablet daily",
                purpose: "General nutritional support and overall health maintenance",
                instructions: "Take with breakfast for best absorption. This will help fill any nutritional gaps in your diet."
              },
              {
                name: "Atorvastatin",
                dosage: "20mg daily",
                purpose: "To help lower cholesterol levels naturally",
                instructions: "Take in the evening as your body produces more cholesterol at night. This medication is very effective and safe."
              }
            ],
            nextSteps: [
              "Schedule a follow-up appointment in 3 months to recheck your hemoglobin and cholesterol levels",
              "Start taking the prescribed iron supplement daily - you should start feeling more energetic in a few weeks",
              "Include more iron-rich foods in your diet: spinach, lentils, lean red meat, and fortified cereals",
              "Try to walk for 30 minutes daily - this will help with cholesterol and overall health",
              "Stay well hydrated and maintain a balanced diet with plenty of fruits and vegetables",
              "Consider cooking in cast iron pans to naturally increase iron intake"
            ],
            concerns: [
              "Mild anemia needs monitoring, but it's not serious and very treatable with supplements and diet",
              "Slightly elevated cholesterol is manageable with the prescribed medication and lifestyle changes"
            ]
          };
        } else if (extractedText.includes('Metformin') || extractedText.includes('Lisinopril') || extractedText.includes('PRESCRIPTION')) {
          // Prescription analysis
          analysis = {
            summary: "You've been prescribed a well-balanced combination of medications to help manage your health conditions. These are all commonly prescribed, safe medications that work well together.",
            testResults: [],
            medications: [
              {
                name: "Metformin",
                dosage: "500mg twice daily",
                purpose: "To help control blood sugar levels and manage diabetes",
                instructions: "Take with meals to reduce stomach upset. This medication helps your body use insulin more effectively and is the first-line treatment for diabetes."
              },
              {
                name: "Lisinopril",
                dosage: "10mg once daily",
                purpose: "To control blood pressure and protect your heart and kidneys",
                instructions: "Take at the same time each day. This medication helps relax blood vessels and reduces strain on your heart."
              },
              {
                name: "Vitamin D3",
                dosage: "1000 IU daily",
                purpose: "To support bone health and immune system function",
                instructions: "Take with a meal containing some fat for better absorption. Vitamin D is essential for strong bones and overall health."
              },
              {
                name: "Omega-3 Fish Oil",
                dosage: "1000mg twice daily",
                purpose: "To support heart health and reduce inflammation",
                instructions: "Take with meals to reduce any fishy aftertaste. These healthy fats are great for your heart and brain."
              }
            ],
            nextSteps: [
              "Take all medications exactly as prescribed by your doctor",
              "Monitor your blood sugar levels daily as instructed",
              "Schedule your follow-up appointment in 4 weeks",
              "Keep a medication diary to track how you're feeling",
              "Call your doctor immediately if you experience any concerning side effects",
              "Maintain a healthy diet and regular exercise routine"
            ],
            concerns: [
              "Monitor for any side effects and report them to your doctor",
              "Don't skip doses - consistency is key for these medications to work effectively"
            ]
          };
        } else if (extractedText.includes('X-RAY') || extractedText.includes('CHEST') || extractedText.includes('SCAN')) {
          // Scan/X-ray analysis
          analysis = {
            summary: "Great news! Your chest X-ray shows completely normal results. Your heart, lungs, and chest structures all appear healthy with no signs of any problems.",
            testResults: [
              {
                test: "Heart Size",
                value: "Normal",
                normalRange: "Normal size and position",
                status: "normal" as const,
                explanation: "Your heart appears to be the right size and in the correct position. This is a great sign of good cardiovascular health!"
              },
              {
                test: "Lung Fields",
                value: "Clear bilaterally",
                normalRange: "Clear, no abnormalities",
                status: "normal" as const,
                explanation: "Both of your lungs are completely clear with no signs of infection, fluid, or other problems. Your breathing passages look healthy!"
              },
              {
                test: "Bone Structures",
                value: "Normal",
                normalRange: "No fractures or abnormalities",
                status: "normal" as const,
                explanation: "All the bones visible in your chest X-ray appear normal and healthy with no signs of fractures or other issues."
              }
            ],
            medications: [],
            nextSteps: [
              "No immediate medical follow-up is required based on these normal results",
              "Continue with your current treatment plan as recommended by your doctor",
              "Maintain good respiratory health with regular exercise",
              "If you develop any new symptoms, don't hesitate to contact your healthcare provider",
              "Keep this report for your medical records"
            ],
            concerns: []
          };
        } else {
          // Generic analysis for unclear or other types of reports
          analysis = {
            summary: "We've analyzed your medical report. While we could extract some information, some details may need clarification from your healthcare provider for the most accurate interpretation.",
            testResults: [],
            medications: [],
            nextSteps: [
              "Discuss these results with your healthcare provider for detailed interpretation",
              "Keep this report in your medical records",
              "Follow any specific instructions given by your doctor",
              "Schedule follow-up appointments as recommended"
            ],
            concerns: [
              "Some details in the report may need professional medical interpretation"
            ]
          };
        }
        
        resolve(analysis);
      }, 4000); // 4 second AI analysis simulation
    });
  };

  // Main analysis function that combines OCR and AI
  const analyzeReport = async (imageFile: File): Promise<MedicalReport> => {
    setOcrError(null);
    
    try {
      // Step 1: Perform OCR
      const extractedText = await performOCR(imageFile);
      
      // Step 2: Perform AI Analysis
      const aiAnalysis = await performAIAnalysis(extractedText);
      
      // Step 3: Determine report type
      let reportType: MedicalReport['type'] = 'other';
      if (extractedText.includes('GLUCOSE') || extractedText.includes('HEMOGLOBIN')) {
        reportType = 'blood_test';
      } else if (extractedText.includes('PRESCRIPTION') || extractedText.includes('Rx:')) {
        reportType = 'prescription';
      } else if (extractedText.includes('X-RAY') || extractedText.includes('SCAN') || extractedText.includes('MRI')) {
        reportType = 'scan';
      } else if (extractedText.includes('DISCHARGE') || extractedText.includes('SUMMARY')) {
        reportType = 'discharge';
      }

      const newReport: MedicalReport = {
        id: Date.now().toString(),
        name: imageFile.name.replace(/\.[^/.]+$/, "") || `Report ${new Date().toLocaleDateString()}`,
        type: reportType,
        uploadDate: new Date().toISOString(),
        imageUrl: URL.createObjectURL(imageFile),
        extractedData: {
          rawText: extractedText,
          structuredData: aiAnalysis
        },
        aiAnalysis,
        translations: {},
        isLocked: false,
        tags: [reportType.replace('_', ' '), 'analyzed']
      };

      return newReport;
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : 'Failed to analyze report');
      throw error;
    }
  };

  // Handle file upload with real processing
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setIsAnalyzing(true);
    setOcrProgress(0);
    setAnalysisProgress(0);
    setOcrError(null);
    
    try {
      const analyzedReport = await analyzeReport(file);
      const updatedReports = [analyzedReport, ...reports];
      saveReports(updatedReports);
      setSelectedReport(analyzedReport);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error analyzing report:', error);
      // Error is already set in analyzeReport function
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Retry OCR processing
  const retryProcessing = async () => {
    if (!selectedReport) return;
    
    setIsAnalyzing(true);
    setOcrError(null);
    setOcrProgress(0);
    setAnalysisProgress(0);
    
    try {
      // Re-fetch the image file (in a real app, you'd store the original file)
      const response = await fetch(selectedReport.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], selectedReport.name, { type: 'image/jpeg' });
      
      const analyzedReport = await analyzeReport(file);
      
      // Update the existing report
      const updatedReports = reports.map(report =>
        report.id === selectedReport.id ? { ...analyzedReport, id: selectedReport.id } : report
      );
      saveReports(updatedReports);
      setSelectedReport({ ...analyzedReport, id: selectedReport.id });
    } catch (error) {
      console.error('Error retrying analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Handle gallery upload
  const handleGalleryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Delete report
  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    saveReports(updatedReports);
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  // Toggle report lock
  const toggleReportLock = (reportId: string) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, isLocked: !report.isLocked } : report
    );
    saveReports(updatedReports);
  };

  // Rename report
  const renameReport = (reportId: string, newName: string) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, name: newName } : report
    );
    saveReports(updatedReports);
    setEditingReportName(null);
    setNewReportName('');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-secondary-custom bg-white/5';
    }
  };

  // Get report type icon
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'blood_test': return Activity;
      case 'prescription': return Pill;
      case 'scan': return Brain;
      case 'discharge': return ClipboardList;
      default: return FileText;
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Upload Section Component
  const UploadSection = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <motion.div
        className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 border border-blue-200 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="mb-6"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="bg-card-surface rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
            <Stethoscope className="h-10 w-10 text-blue-600" />
          </div>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Let's understand your medical reports together
        </h2>
        <p className="text-blue-700 leading-relaxed max-w-2xl mx-auto">
          Upload any medical report, prescription, or lab result. Our AI will read the text, analyze the content, 
          and explain everything in simple, comforting language that's easy to understand. You're taking great care of your health!
        </p>
      </motion.div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Upload */}
        <motion.div
          className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <motion.div
            className="mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center">
              <Camera className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
          
          <h3 className="text-xl font-bold text-primary-custom mb-4">Take a Photo</h3>
          <p className="text-secondary-custom mb-6 leading-relaxed">
            Use your camera to capture a clear photo of your medical report or prescription. 
            Make sure the text is clearly visible and well-lit.
          </p>
          
          <motion.button
            onClick={handleCameraCapture}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="h-5 w-5" />
            <span>Open Camera</span>
          </motion.button>
        </motion.div>

        {/* Gallery Upload */}
        <motion.div
          className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <motion.div
            className="mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center">
              <Upload className="h-10 w-10 text-purple-600" />
            </div>
          </motion.div>
          
          <h3 className="text-xl font-bold text-primary-custom mb-4">Upload from Gallery</h3>
          <p className="text-secondary-custom mb-6 leading-relaxed">
            Choose an existing photo of your medical report from your device gallery. 
            Ensure the image is clear and the text is readable.
          </p>
          
          <motion.button
            onClick={handleGalleryUpload}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-5 w-5" />
            <span>Choose from Gallery</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Supported Formats */}
      <motion.div
        className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-primary-custom mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          Supported Report Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Activity, label: 'Blood Tests', color: 'text-red-600 bg-red-50' },
            { icon: Brain, label: 'MRI/CT Scans', color: 'text-purple-600 bg-purple-50' },
            { icon: Pill, label: 'Prescriptions', color: 'text-green-600 bg-green-50' },
            { icon: ClipboardList, label: 'Discharge Summary', color: 'text-blue-600 bg-blue-50' }
          ].map((type, index) => (
            <motion.div
              key={type.label}
              className={`p-4 rounded-xl ${type.color} text-center`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <type.icon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{type.label}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-2">Tips for Best Results:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure good lighting when taking photos</li>
            <li>• Keep the camera steady and focus on the text</li>
            <li>• Make sure all text is visible and not cut off</li>
            <li>• Avoid shadows or glare on the document</li>
          </ul>
        </div>
      </motion.div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  );

  // Reports List Component
  const ReportsSection = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <motion.div
        className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-custom" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by name or tags..."
              className="w-full pl-10 pr-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="blood_test">Blood Tests</option>
            <option value="prescription">Prescriptions</option>
            <option value="scan">Scans</option>
            <option value="discharge">Discharge</option>
          </select>
        </div>
      </motion.div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <motion.div
          className="bg-card-surface rounded-3xl p-12 shadow-lg border border-card-custom text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FileText className="h-16 w-16 text-secondary-custom mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-custom mb-2">No Reports Found</h3>
          <p className="text-secondary-custom">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first medical report to get started'
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => {
            const ReportIcon = getReportTypeIcon(report.type);
            return (
              <motion.div
                key={report.id}
                className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {/* Report Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-3">
                      <ReportIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      {editingReportName === report.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newReportName}
                            onChange={(e) => setNewReportName(e.target.value)}
                            className="text-sm font-semibold bg-white/5 border border-card-custom rounded px-2 py-1 flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameReport(report.id, newReportName);
                              } else if (e.key === 'Escape') {
                                setEditingReportName(null);
                                setNewReportName('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => renameReport(report.id, newReportName)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 
                          className="font-semibold text-primary-custom cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setEditingReportName(report.id);
                            setNewReportName(report.name);
                          }}
                        >
                          {report.name}
                        </h3>
                      )}
                      <p className="text-sm text-secondary-custom">
                        {new Date(report.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleReportLock(report.id)}
                      className={`p-2 rounded-full transition-colors ${
                        report.isLocked 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-secondary-custom hover:text-secondary-custom hover:bg-white/5'
                      }`}
                    >
                      {report.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Report Preview */}
                <div className="mb-4">
                  <img
                    src={report.imageUrl}
                    alt={report.name}
                    className="w-full h-32 object-cover rounded-xl border border-card-custom"
                  />
                </div>

                {/* Report Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {report.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {report.tags.length > 2 && (
                    <span className="px-2 py-1 bg-white/5 text-secondary-custom text-xs rounded-full">
                      +{report.tags.length - 2} more
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => {
                      setSelectedReport(report);
                      setActiveTab('analysis');
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Analysis</span>
                  </motion.button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = report.imageUrl;
                      link.download = `${report.name}.jpg`;
                      link.click();
                    }}
                    className="p-2 bg-white/5 text-secondary-custom hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Analysis Section Component
  const AnalysisSection = () => {
    if (!selectedReport) {
      return (
        <div className="bg-card-surface rounded-3xl p-12 shadow-lg border border-card-custom text-center">
          <Brain className="h-16 w-16 text-secondary-custom mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-custom mb-2">No Report Selected</h3>
          <p className="text-secondary-custom">Select a report from your records to view the AI analysis</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* OCR Error Display */}
        {ocrError && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-3xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-700 mb-4">{ocrError}</p>
                <motion.button
                  onClick={retryProcessing}
                  disabled={isAnalyzing}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reprocess Report</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comfort Message */}
        <motion.div
          className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border border-green-200 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="mb-6"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="bg-card-surface rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
              <Heart className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            You're doing well. This report is just a part of your health journey
          </h2>
          <p className="text-green-700 leading-relaxed max-w-2xl mx-auto">
            Let's understand it together. We've analyzed your report and explained everything in simple, 
            friendly language. Remember, knowledge is power, and you're taking great care of yourself!
          </p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Languages className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-primary-custom">
                In which language would you like to understand your report?
              </h3>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
              >
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">{selectedLanguage.flag}</span>
                <span className="font-medium text-blue-800 dark:text-blue-200">{selectedLanguage.nativeName}</span>
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
              
              <AnimatePresence>
                {showLanguageSelector && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 bg-card-surface rounded-2xl shadow-2xl border border-card-custom z-50 max-h-80 overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    style={{ minWidth: '300px' }}
                  >
                    <div className="p-4">
                      <h4 className="font-semibold text-primary-custom mb-3">Select Language</h4>
                      <div className="space-y-2">
                        {supportedLanguages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              setSelectedLanguage(language);
                              setShowLanguageSelector(false);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                              selectedLanguage.code === language.code
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                                : 'hover:bg-white/5/50'
                            }`}
                          >
                            <span className="text-xs font-bold bg-white/5 text-primary-custom px-2 py-1 rounded uppercase w-8 text-center">{language.flag}</span>
                            <div className="text-left">
                              <p className="font-medium text-primary-custom">{language.nativeName}</p>
                              <p className="text-sm text-secondary-custom">{language.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Analysis Tabs */}
        <motion.div
          className="bg-card-surface rounded-3xl shadow-lg border border-card-custom overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Tab Headers */}
          <div className="flex border-b border-card-custom">
            {[
              { id: 'summary', label: 'Test Summary', icon: Activity },
              { id: 'medications', label: 'Medicines', icon: Pill },
              { id: 'next-steps', label: 'Next Steps', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAnalysisTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                  analysisTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                    : 'text-secondary-custom hover:text-primary-custom hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {analysisTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-primary-custom mb-4">Overall Summary</h3>
                    <p className="text-secondary-custom leading-relaxed bg-blue-50 p-4 rounded-xl">
                      {selectedReport.aiAnalysis.summary}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-primary-custom">Test Results</h4>
                    {selectedReport.aiAnalysis.testResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-16 w-16 text-secondary-custom mx-auto mb-4" />
                        <p className="text-secondary-custom">No specific test results found in this report</p>
                      </div>
                    ) : (
                      selectedReport.aiAnalysis.testResults.map((test, index) => (
                        <motion.div
                          key={index}
                          className="border border-card-custom rounded-xl p-6"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h5 className="font-semibold text-primary-custom">{test.test}</h5>
                              <p className="text-2xl font-bold text-primary-custom mt-1">{test.value}</p>
                              <p className="text-sm text-secondary-custom">Normal: {test.normalRange}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-secondary-custom leading-relaxed">{test.explanation}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {analysisTab === 'medications' && (
                <motion.div
                  key="medications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-custom mb-6">Prescribed Medications</h3>
                  {selectedReport.aiAnalysis.medications.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-16 w-16 text-secondary-custom mx-auto mb-4" />
                      <p className="text-secondary-custom">No medications prescribed in this report</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedReport.aiAnalysis.medications.map((medication, index) => (
                        <motion.div
                          key={index}
                          className="bg-green-50 border border-green-200 rounded-xl p-6"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start">
                            <div className="bg-green-500 rounded-full p-2 mr-4 mt-1">
                              <Pill className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-green-800 text-lg">{medication.name}</h5>
                              <p className="text-green-700 font-medium mb-2">{medication.dosage}</p>
                              <p className="text-green-700 mb-3">{medication.purpose}</p>
                              <div className="bg-card-surface p-3 rounded-lg border border-green-200">
                                <p className="text-sm font-medium text-green-800 mb-1">Instructions:</p>
                                <p className="text-green-700">{medication.instructions}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {analysisTab === 'next-steps' && (
                <motion.div
                  key="next-steps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-primary-custom mb-6">Recommended Next Steps</h3>
                    <div className="space-y-4">
                      {selectedReport.aiAnalysis.nextSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <p className="text-blue-800 leading-relaxed flex-1">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {selectedReport.aiAnalysis.concerns.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary-custom mb-4">Areas to Monitor</h4>
                      <div className="space-y-3">
                        {selectedReport.aiAnalysis.concerns.map((concern, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <p className="text-yellow-800 leading-relaxed">{concern}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="h-5 w-5" />
              <span>Set Medicine Reminder</span>
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="h-5 w-5" />
              <span>Email to Doctor</span>
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share className="h-5 w-5" />
              <span>Share Report</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (showPrivacyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lock className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-custom mb-2">Privacy Mode Enabled</h2>
          <p className="text-secondary-custom mb-6">Your medical reports are protected</p>
          <button
            onClick={() => setShowPrivacyMode(false)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            <Eye className="h-5 w-5 inline mr-2" />
            Show Reports
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-primary-custom">Report Decoder & Records</h1>
              <p className="text-secondary-custom mt-1">AI-powered medical report analysis and translation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowPrivacyMode(true)}
              className="p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <EyeOff className="h-5 w-5 text-secondary-custom" />
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex bg-card-surface rounded-2xl p-1 mb-8 shadow-lg border border-card-custom">
          {[
            { id: 'upload', label: 'Upload Report', icon: Upload },
            { id: 'reports', label: `My Reports (${reports.length})`, icon: FileText },
            { id: 'analysis', label: 'AI Analysis', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-secondary-custom hover:text-primary-custom hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UploadSection />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportsSection />
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnalysisSection />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload/Analysis Loading Overlay */}
        <AnimatePresence>
          {(isUploading || isAnalyzing) && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-card-surface rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  className="mb-6"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center">
                    <Brain className="h-10 w-10 text-blue-600" />
                  </div>
                </motion.div>
                
                <h3 className="text-xl font-bold text-primary-custom mb-4">
                  {isUploading && !isAnalyzing ? 'Uploading your report...' : 
                   ocrProgress < 100 ? 'Reading text from your report...' : 
                   'Analyzing with AI...'}
                </h3>
                <p className="text-secondary-custom leading-relaxed mb-6">
                  {isUploading && !isAnalyzing 
                    ? 'Please wait while we securely upload your medical report.'
                    : ocrProgress < 100 
                    ? 'Our OCR technology is carefully extracting all the text from your medical report.'
                    : 'Our AI is analyzing the extracted text to provide you with clear, easy-to-understand explanations.'
                  }
                </p>
                
                <div className="space-y-4">
                  {/* OCR Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-secondary-custom mb-2">
                      <span>Text Extraction</span>
                      <span>{Math.round(ocrProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${ocrProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* AI Analysis Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-secondary-custom mb-2">
                      <span>AI Analysis</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ReportDecoderPage;