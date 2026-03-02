# DesignSync: AI-Powered Design Collaboration Dashboard

DesignSync is a modern, responsive web application built for design teams to manage projects, upload graphical assets, collaborate in real-time, and view AI-powered analytics. 

It provides an immersive dashboard experience featuring a state-of-the-art UI with glassmorphism effects, a dual-layer sidebar, smooth micro-animations, and full dark/light mode support.

## 🚀 Features

- **Authentication System:** Secure mock JWT flow with OTP verification and role-based access control (Admin, Designer, Viewer).
- **Project Workspace:** Create, organize, and manage design projects. Support for Drag-and-Drop (DnD) file uploads and asset tagging.
- **AI Tools Integration:** Mock API integration simulating AI-powered design features like background removal, smart cropping, and resolution upscaling with a polished progress overlay.
- **Real-Time Collaboration:** Simulated live multi-player cursors, editing indicators, and live activity feeds/comments.
- **Analytics Dashboard:** Recharts integration displaying visually engaging KPI data, asset usage trends, and AI processing metrics.
- **User Settings:** Theme toggling (Dark/Light mode), notification preferences, and account management.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS v4 + Vanilla CSS (Custom Design System)
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Animations & Interaction:** Framer Motion, @dnd-kit/core
- **Icons:** Lucide React
- **Data Validation:** Zod
- **Notifications:** React Hot Toast
- **Charting:** Recharts

## 📦 Getting Started

### Prerequisites

Ensure you have Node.js installed (v18+ recommended).

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Authentication (Mock)
- **Email:** `admin@designsync.com` (any valid email format will trigger the flow).
- **OTP Code:** Check the browser console, or default to generic mocked OTPs based on the codebase logic. 

## 🏗️ Architecture Notes

- App uses the new Next.js App Router (`src/app`).
- Mock services reside in `/src/services` to simulate API behavior using timeouts and local state.
- Redux slices map directly to feature areas (`authSlice`, `projectsSlice`, `collaborationSlice`).
- Tailwind handles utility styling, while `globals.css` manages robust structural layouts like glassmorphism loops, custom scrollbars, and select/form components.
