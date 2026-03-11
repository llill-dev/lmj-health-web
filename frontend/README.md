# LMJ Health – Frontend Application

A modern frontend application for LMJ Health, a digital healthcare platform supporting patients, doctors, administrators, secretaries, and data-entry users through a secure and scalable web interface.

**Version**: 2.0.0 (React + Vite SPA)  
**Last Updated**: March 11, 2026

This repository contains the frontend codebase only, built with a strong focus on:

- Medical-grade UX with professional animations
- Role-based access control
- Data privacy and security
- High performance and maintainability
- Modern React SPA architecture

---

## 🏥 Project Overview

LMJ Health is a multi-role medical platform that enables:

- Patient profile and medical record access
- Doctor onboarding and verification
- Appointment scheduling and availability management
- Consultation tickets and follow-up communication
- Administrative governance and approvals
- Dynamic healthcare service directories
- Location-based doctor discovery

The frontend is designed as a secure presentation layer on top of a centralized backend API, strictly respecting permission boundaries and medical data sensitivity.

---

## 🧱 Tech Stack

- **Framework**: React + Vite SPA
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State & Data Fetching**: TanStack Query (React Query)
- **Forms & Validation**: react-hook-form + Zod
- **Authentication**: JWT via httpOnly cookies
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Build Tool**: Vite

---

## 🎨 Animation & Transitions System

The application features a professional animation system:

- **Page Transitions**: Smooth fade and slide transitions between routes
- **Component Animations**: Reusable variants for stagger effects
- **Accessibility**: Respects user's motion preferences
- **Performance**: GPU-accelerated 60fps animations

### Available Animation Variants

- `fadeIn` - Simple opacity transition
- `fadeInUp` - Fade with upward slide
- `staggerContainer` - Container for sequential animations
- `staggerItem` - Individual item for stagger effects

---

## 🧠 Architectural Principles

This frontend follows a governance-first architecture, designed specifically for healthcare systems:

- Clear separation of concerns (pages, components, services, hooks)
- Role-based routing and conditional rendering
- No business logic leakage into UI layers
- Predictable state management for medical workflows
- Audit-aware UI patterns for sensitive actions
- Performance-optimized animations and transitions

---

## 👥 Supported User Roles

- **Patients** – Access personal health data, appointments, and consultations
- **Doctors** – Manage schedules, patients, medical records, and consultations
- **Secretaries** – Operate under delegated doctor permissions
- **Administrators** – Approvals, oversight, and platform governance
- **Data-entry Users** – Maintain service catalogs and operational data

Each role has isolated UI flows and permission-aware interfaces.

---

## 🔐 Security & Privacy Considerations

- No sensitive data stored in localStorage
- Role and permission checks enforced at routing and UI level
- API access secured via backend-issued JWT cookies
- Geolocation and medical data handled with strict boundaries
- Designed to align with healthcare data protection best practices

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:emad-alsmadi/lmj-health.git
cd lmj-health/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server runs on `http://localhost:5173` with:

- ⚡️ Instant Hot Module Replacement (HMR)
- 🎨 Tailwind CSS with JIT compilation
- 🔄 React Router with proper state management
- 🎬 Framer Motion dev tools integration

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── doctor/        # Doctor-specific components
│   │   └── ui/            # Reusable UI components
│   ├── pages/
│   │   ├── auth/          # Authentication pages
│   │   ├── doctor/        # Doctor dashboard pages
│   │   ├── welcome/       # Welcome page
│   │   └── not-found/     # 404 page
│   ├── motion/
│   │   ├── variants.ts    # Animation definitions
│   │   ├── PageTransition.tsx
│   │   └── MotionProvider.tsx
│   ├── store/             # State management
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── types/             # TypeScript types
│   ├── styles/            # Global styles
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── layout.tsx         # Doctor layout
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 Key Features

### Modern SPA Architecture

- **React Router v6** for client-side routing
- **Protected routes** with role-based access control
- **Smooth page transitions** with Framer Motion
- **Component-based architecture** for maintainability

### Professional UI/UX

- **Medical-grade design** with attention to detail
- **Responsive layout** for all device sizes
- **Accessibility features** including reduced motion support
- **Professional animations** that enhance user experience

### Developer Experience

- **TypeScript** for type safety
- **Vite** for lightning-fast development
- **Hot Module Replacement** for instant feedback
- **ESLint** and **Prettier** for code quality

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=LMJ Health
```

### Build Configuration

The project uses Vite with the following optimizations:

- **Code splitting** by routes
- **Tree shaking** for unused code
- **Asset optimization** for images and fonts
- **Production builds** are optimized for performance

---

## 📊 Performance Metrics

- **Development server**: Starts in <1 second
- **Hot reload**: Instant updates
- **Production bundle**: Optimized for fast loading
- **Animation performance**: 60fps on modern devices
- **Bundle size**: Optimized with code splitting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 📞 Support

For technical support or questions, please contact the development team.

---

**Version History**:

- v2.0.0 - Complete migration to React + Vite SPA with animations (March 11, 2026)
- v1.x.x - Original Next.js implementation
