# 🏥 AarogyaCare — Your Intelligent Health Companion

> AI-powered health tracking and wellness management platform built for the **MSME IDEA Hackathon 6.0**

**By Abhijit Chauhan & Krishna**

---

## 🌟 Problem Statement

Managing personal health is fragmented — people use different apps for water intake, sleep, exercise, medications, and mental wellness. There's no unified platform that tracks all health metrics, provides AI-powered insights, and makes health management engaging through gamification.

## 💡 Solution

**AarogyaCare** is an all-in-one health companion that:
- Tracks **water intake, steps, sleep, BMI, and medications** in one place
- Provides an **AI-powered health assistant** for wellness Q&A
- Features an **agentic Daily Health Insight** that analyzes your data and gives personalized recommendations
- Uses **gamification** (streaks, badges, achievements) to make health tracking fun
- Supports **Hindi & English** languages

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** + **TypeScript** | Frontend framework |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Animations & micro-interactions |
| **Supabase** | Auth, Database (PostgreSQL), RLS |
| **OpenAI / DeepSeek** | AI Health Assistant & Insights |
| **Lucide React** | Icon library |

---

## 🚀 Features

### Health Trackers
- 💧 **Water Intake Tracker** — daily glass count with weekly chart
- 🏃 **Steps Tracker** — manual entry + GPS tracking
- 😴 **Sleep Tracker** — bed/wake time, duration, quality
- ⚖️ **BMI Calculator** — with history & trend graphs
- 💊 **Medication Reminders** — schedule, log, track adherence
- 🧠 **Mental Wellness** — mood journaling, gratitude entries
- 🩸 **Menstruation Tracker** — cycle prediction & logging
- 🏋️ **Workout & Diet Plans** — AI-generated workout routines

### AI & Agentic Features
- 🤖 **Inline AI Chat Widget** — ask health questions from any page
- 🧑‍⚕️ **Full AI Health Assistant** — deep conversation with context
- 💜 **AI Mood Companion** — emotional support & listening
- 📊 **Daily Health Insight Agent** — autonomous multi-tracker analysis with actionable recommendations

### Other
- 🏆 **Achievements & Badges** — 9-tier badge system for consistency
- 🔥 **Streak System** — gamified daily activity tracking
- 🏥 **Nearby Hospitals** — location-based hospital finder
- 🚨 **Emergency Contacts** — quick access emergency system
- 📋 **Report Decoder** — AI-powered medical report analysis
- 🌙 **Dark Mode** — full theme support with system detection
- 🌐 **Bilingual** — English & Hindi

---

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/abhijit-live/healthoi.git
cd healthoi

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_OPENAI_API_KEY (or VITE_DEEPSEEK_API_KEY)
# - GOMAPS_API_KEY

# Start the development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           → ProtectedRoute
│   ├── chat/           → ChatbotIcon, ChatWidget
│   ├── common/         → HealthCard, StatsCard, LoadingSpinner, EmptyState
│   ├── dashboard/      → WaterTracker, StepsTracker, SleepTracker, StreakDisplay
│   ├── gamification/   → BadgeUnlockModal, EmergencyButton
│   └── layout/         → Header, Footer
├── contexts/           → AuthContext, ThemeContext, StreakContext, ToastContext
├── hooks/              → useSupabaseAuth, useHealthData, useLanguage
├── lib/                → Supabase client & types
├── pages/              → All page components
├── styles/             → Design tokens
├── types/              → TypeScript interfaces
└── utils/              → Translations
```

---

## 🔒 Security

- All API keys stored in `.env` (git-ignored)
- Supabase Row Level Security (RLS) on all tables
- Route protection — no page accessible without authentication
- Guest mode clearly labeled, data not persisted

---

## 📄 License

MIT

---

**Made with ❤️ by Abhijit Chauhan & Krishna** for MSME IDEA Hackathon 6.0