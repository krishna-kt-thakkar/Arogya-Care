# Firebase Setup Guide for Arogya Care

This guide explains how to obtain, configure, and connect your Firebase API keys to enable **Google Sign-In, Firebase Auth, and Firestore Database** in Arogya Care.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter your project name (e.g., `arogya-care`) and click **Continue**.
4. Choose whether to enable Google Analytics (optional, you can disable it) and click **Create project**.

---

## 2. Register Your Web Application

1. In the center of the Firebase project homepage, click the **Web icon** (`</>`) to add an app.
2. Enter an app nickname (e.g., `Arogya Care Web`).
3. Click **Register app**.
4. You will see a `firebaseConfig` object containing credentials. Keep this window open.

---

## 3. Configure Authentication Services

Arogya Care requires **Email/Password** and **Google Sign-In** options.

1. In the Firebase left sidebar, click **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   * **Email/Password**: Toggle to enabled and click **Save**.
   * **Google**: Toggle to enabled. Select a project support email and click **Save**.

---

## 4. Configure Firestore Database (Optional)

If storing logs and tracker metrics in the cloud instead of localStorage:

1. Click **Build** -> **Firestore Database** in the left sidebar.
2. Click **Create database**.
3. Choose a database location close to you, and click **Next**.
4. Select **Start in test mode** (allows direct read/write during development) and click **Create**.

---

## 5. Configure Your Local `.env` Credentials

1. Open the project root folder: [Arogya Care](file:///d:/SUMMER%20PROJECT/AROGYA%20CARE).
2. Create a new file named `.env` in the root (you can copy [.env.example](file:///d:/SUMMER%20PROJECT/AROGYA%20CARE/.env.example) if it exists).
3. Copy the credentials from the Firebase Web App setup and populate the variables exactly like this:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Restart your development server (`npm run dev`) to apply the new environment parameters.
