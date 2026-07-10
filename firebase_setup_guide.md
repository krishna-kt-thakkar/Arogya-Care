# Secure Firebase Setup & Vercel Deployment Guide

This guide explains how to secure your Firebase credentials, run the project locally without leaking keys to GitHub, and safely add them to **Vercel** for production hosting.

---

## 1. Safety & Prevention of Credentials Leakage

To prevent credentials from being exposed publicly on GitHub:
* **Never hardcode credentials** inside your code files.
* **Keep secrets in a `.env` file**. The `.gitignore` file of this project contains `.env` on line 25, which guarantees that Git will ignore the file and it will never be uploaded to GitHub.
* **Only define credentials in Vercel settings** for your production deployment.

---

## 2. Obtain Your Firebase Credentials

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project. If you don't have one, click **Add project** -> Enter name -> Click **Create**.
3. Under the project homepage, click the **Web icon** (`</>`) to register a new Web App (e.g., `Arogya Care Web`).
4. Firebase will display your config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "arogya-care-12345.firebaseapp.com",
  projectId: "arogya-care-12345",
  storageBucket: "arogya-care-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:12345:web:abcd"
};
```

---

## 3. Local Machine Setup (Run Safely on localhost)

To run the application locally on your machine without committing files to GitHub:

1. Open the project root folder: [Arogya Care](file:///d:/SUMMER%20PROJECT/AROGYA%20CARE).
2. Create a new file named `.env` (without any extensions).
3. Copy the keys from your Firebase config and write them exactly like this:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-actual-auth-domain-here
VITE_FIREBASE_PROJECT_ID=your-actual-project-id-here
VITE_FIREBASE_STORAGE_BUCKET=your-actual-storage-bucket-here
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id-here
VITE_FIREBASE_APP_ID=your-actual-app-id-here
```

4. Since `.gitignore` blocks `.env`, this file remains entirely local to your computer and will never leak to GitHub.

---

## 4. Production Setup (Deploy Safely on Vercel)

When deploying to Vercel, Vercel needs to know these variables at build time. Here is exactly how to paste them into Vercel:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and select your imported project.
2. In the top navigation tabs, click on **Settings**.
3. In the left sidebar of Settings, click on **Environment Variables**.
4. In the "Key" and "Value" inputs, add your variables. 

   > [!TIP]
   > Vercel allows you to copy and paste your entire `.env` file content directly. Copy your `.env` contents, click the first input box under the "Environment Variables" section, and paste (`Ctrl + V`). Vercel will automatically parse all 6 variables!

### Variables to Add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `...firebaseapp.com` | Firebase Authentication Domain |
| `VITE_FIREBASE_PROJECT_ID` | `arogya-care-...` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `...appspot.com` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `12345...` | Firebase Cloud Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:12345...` | Firebase App ID |

5. Select the environments where these variables should apply: **Production**, **Preview**, and **Development** (keep all checked).
6. Click **Save**.
7. Go to the **Deployments** tab and redeploy/deploy your project. Vercel will build the bundle using the environment variables securely injected at build time. No key will be visible in the source code!
