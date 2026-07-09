# AROGYA CARE

AROGYA CARE is a comprehensive personal health tracking and wellness management application. Built as an all-in-one platform, it unifies daily hydration logs, sleep tracking, physical activity, BMI calculation, medication schedules, and mental wellness journaling. The platform features an AI health assistant, dynamic accent theme customizer, location services, and emergency configuration.

Designed for the MSME IDEA Hackathon 6.0.

---

## Features

### Core Health Trackers
* **Water Intake Tracker**: Log daily water consumption with visual progress rings.
* **Sleep Tracker**: Monitor sleep cycles, bed times, wake times, and sleep quality indexes.
* **Steps Tracker**: Manual and GPS-based physical activity log.
* **BMI & Vitals Logs**: Record and view height, weight, BMI trends, and blood pressure levels.
* **Medication Reminders**: Schedule daily medication times and track logging compliance.
* **Mental Wellness**: Mood journaling and guided breathing features.
* **Menstruation Cycle Tracker**: Track cycles and predictions (available dynamically based on profile).

### Intelligence & Security
* **AROGYA CARE AI**: Inline health question assistant, mood companion, and report decoder tools.
* **Emergency Contacts & SOS**: Configurable list of emergency contacts with one-tap SOS functionality.
* **Multi-Theme System**: Seamlessly switch between four dark-mode-optimized color accents (Deep Space, Emerald Care, Sunset Glow, and Cyber Neon).
* **Bilingual Support**: Dynamic translation between English and Hindi.
* **Fail-Safe Auth Fallback**: Integrated developer mode bypass. If database configurations are missing, authentication is simulated so that the app remains testable in offline/demo environments.

---

## Tech Stack

* **Frontend**: React 18 (TypeScript), Vite
* **Styling**: Tailwind CSS, Framer Motion
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
* **Icons**: Lucide React

---

## Project Structure

```text
src/
├── components/
│   ├── auth/           → Route guards and protected layouts
│   ├── chat/           → Inline AI widget panel components
│   ├── common/         → Reusable components (HealthCard, StatsCard, EmptyState, Spinner)
│   ├── dashboard/      → Trackers (Steps, Sleep, Water) and Streak gauges
│   ├── gamification/   → Emergency and consistency badges
│   └── layout/         → Navigation Headers and Footers
├── contexts/           → Global state engines (Auth, Streaks, Themes, Toasts)
├── hooks/              → Custom hooks (useHealthData, useLanguage, useSupabaseAuth)
├── lib/                → Supabase clients and TypeScript database interface mappings
├── pages/              → Dashboard, Landing Page, and auxiliary view pages
├── styles/             → Design tokens and variables
├── types/              → Standard type definitions
└── utils/              → Multi-language translations
```

---

## Local Development Setup

### Prerequisites
* Node.js (version 18 or above)
* npm package manager

### Steps
1. Clone this repository to your local directory:
   ```bash
   git clone https://github.com/krishna-kt-thakkar/Arogya-Care.git
   cd Arogya-Care
   ```

2. Install the package dependencies:
   ```bash
   npm install
   ```

3. Set up the local environment file. Duplicate `.env.example` and name the copy `.env`:
   ```bash
   cp .env.example .env
   ```

4. Open the `.env` file and insert your API credentials:
   ```text
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

5. Launch the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the port indicated in the terminal (usually `http://localhost:5173` or `http://localhost:5174`).

6. Compile the code for production delivery:
   ```bash
   npm run build
   ```

---

## Deployment Guide

### Option 1: Deploying on Render (Static Site)
Render supports hosting static sites built with Vite.

1. Create a free account at [Render](https://render.com/).
2. On your Render Dashboard, click **New** and select **Static Site**.
3. Link your GitHub account and select the **Arogya-Care** repository.
4. Configure the build parameters:
   * **Name**: `arogya-care` (or any custom name)
   * **Branch**: `main`
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
5. Expand the **Advanced** section to add environment variables. Add the following keys:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_OPENAI_API_KEY`
   * `VITE_DEEPSEEK_API_KEY`
6. Click **Create Static Site**. Render will automatically clone the repository, compile the code, and publish it online.

### Option 2: Deploying on Vercel (Recommended Alternative)
Vercel is optimized for React/Vite frontends and offers fast response times.

1. Sign up at [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Select the **Arogya-Care** repository from your Git provider.
3. Vercel automatically detects the framework as Vite. Keep the default settings:
   * Build Command: `npm run build`
   * Output Directory: `dist`
4. Expand the **Environment Variables** section and paste your `.env` key-value configurations.
5. Click **Deploy**. Your live project URL will be generated within a minute.