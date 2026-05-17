# AttendX - Smart Attendance Management System

AttendX is a production-ready, full-stack Smart Attendance Management System designed to streamline attendance tracking for educational institutions and corporate environments. It features a modern web portal, a mobile application for quick QR code scanning, and a secure backend infrastructure.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for Admins, Teachers, and Students.
- **Dynamic QR Attendance:** 30-second expiring cryptographic QR codes to prevent proxy attendance.
- **Real-Time Sync:** WebSockets integration (Socket.io) for live attendance tracking.
- **Modern UI/UX:** Premium "Cyberpunk Minimalism" SaaS aesthetic using glassmorphism, Framer Motion, and Shadcn UI.
- **Secure Authentication:** Powered by Supabase Auth (or JWT/MongoDB fallback).
- **Mobile Ready:** React Native Expo app for on-the-go scanning.

---

## 🏗️ Architecture

The repository is structured as a monorepo containing three main components:

1. **/backend**
   - Node.js & Express API
   - MongoDB & Mongoose for data persistence
   - Socket.io for real-time communication
   - JWT & Role-Based Middleware

2. **/web**
   - Next.js 15 (App Router)
   - Tailwind CSS v4 & Shadcn UI
   - Framer Motion for animations
   - Supabase Auth integration

3. **/mobile**
   - React Native & Expo
   - NativeWind for styling
   - Expo Camera for QR code scanning (WIP)

---

## 🔐 Security & Keys

**WARNING:** Never commit your environment variables or API keys to version control.
This repository has been audited and contains a strict `.gitignore` to prevent secret leaks.

To run the applications, you must create local environment files:

### Backend (`/backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/attendx
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d
```

### Web (`/web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 💻 Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Ensure you have MongoDB running locally or provide a valid MongoDB Atlas URI.*

### 2. Web Portal Setup
```bash
cd web
npm install
npm run dev
```
*The web portal will be available at `http://localhost:3000`.*

### 3. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```
*Scan the generated QR code with the Expo Go app on your physical device.*

---

## 🔥 Firebase Integration (Optional / Deployment)

Firebase has been configured as part of the MCP configuration for deployment and optional BaaS capabilities.
To deploy the web app via Firebase Hosting:

1. Authenticate with Firebase: `npx firebase login`
2. Build the Next.js app: `cd web && npm run build`
3. Deploy: `npx firebase deploy --only hosting`

---

## 📄 License
MIT License
