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
- **Routing**: React Router
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

- Node.js 20+
- npm

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

- **React Router** for client-side routing
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

Copy `.env.example` to `.env.local` when you need local overrides.

```env
# Optional: leave empty to use same-origin /api requests.
VITE_API_ORIGIN=
VITE_UI_ONLY=false
```

The app endpoints are already defined as `/api/...`. The intended production
contract is same-origin API routing behind Traefik, so the production build
should normally keep `VITE_API_ORIGIN` empty.

### Production Deploy Contract

The frontend production deployment layer uses `deploy/.env.prod` for a small
set of Traefik-facing values. Start from `deploy/.env.prod.example`.

```env
APP_DOMAIN=app.syrhealth.com
COMPOSE_PROJECT_NAME=lmj-frontend
TRAEFIK_PUBLIC_NETWORK=lmj-health-api-proxy
TRAEFIK_ENTRYPOINTS=websecure
FRONTEND_IMAGE_NAME=lmj-health-frontend
FRONTEND_IMAGE_TAG=prod
```

`VITE_API_ORIGIN` should stay empty in production so browser requests continue
to use same-origin `/api`.

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

## 🚢 VPS Deployment

This repository is prepared to be deployed independently from the backend
repository on the same VPS. Traefik remains the only external reverse proxy.

### Frontend stack files

- Compose: `deploy/docker-compose.prod.yml`
- Deploy script: `deploy/prod-deploy.sh`
- Container server: `deploy/Caddyfile`
- Deploy env example: `deploy/.env.prod.example`

### Expected production routing

- `https://app.syrhealth.com` -> frontend container
- `https://app.syrhealth.com/api/*` -> existing backend service

The frontend compose file only defines the frontend router. The `/api` route
must be added on the backend side because the frontend intentionally keeps
same-origin API calls.

### VPS prerequisites

- Docker and Docker Compose plugin installed
- Existing Traefik stack already running
- External Docker network already created for Traefik, matching
  `TRAEFIK_PUBLIC_NETWORK`
- Traefik certificate resolver `letsencrypt` available on the existing Traefik
  instance
- DNS for `app.syrhealth.com` pointed at the VPS

### Manual deploy

```bash
cd frontend
cp deploy/.env.prod.example deploy/.env.prod
./deploy/prod-deploy.sh
```

The deploy script validates the compose file, builds the image, starts the
frontend service, and waits for `/healthz`.

## 🔁 CI/CD

This repository includes two GitHub Actions workflows:

- `frontend-ci.yml`
  Runs on pull requests and pushes to `main`, using Node 20 in the `frontend/`
  directory for `npm ci`, `npm run lint`, `npm run typecheck`, and
  `npm run build`.

- `frontend-deploy-prod.yml`
  Runs on pushes to `main` and manual `workflow_dispatch`. It connects to the
  VPS over SSH, updates the frontend repo at
  `/srv/lmj-frontend/lmj-health-web/frontend`, runs
  `bash deploy/prod-deploy.sh`, and verifies
  `https://app.syrhealth.com/healthz`,
  `https://app.syrhealth.com/`, and
  `https://app.syrhealth.com/api/health`.

### Required GitHub secrets and variables

Secret:

- `FRONTEND_VPS_SSH_PRIVATE_KEY`

Variables:

- `FRONTEND_VPS_HOST`
- `FRONTEND_VPS_PORT`
- `FRONTEND_VPS_USER`
- `FRONTEND_VPS_APP_DIR`

Expected `FRONTEND_VPS_APP_DIR` value:

- `/srv/lmj-frontend/lmj-health-web/frontend`

### Manual deploy workflow run

Use GitHub Actions `Frontend Deploy Prod` and trigger `Run workflow` from the
Actions tab when you need a manual production deployment.

### Required backend-side Traefik addition

Add an extra router to the existing backend service so same-origin API traffic
from `app.syrhealth.com` reaches the backend without changing the frontend
code.

Required rule:

```text
Host(`app.syrhealth.com`) && PathPrefix(`/api`)
```

Required behavior:

- Attach that backend router to the same Traefik external network
- Use the existing TLS/entrypoint model already used by the backend stack
- Point the router at the existing backend service port
- Give the backend `/api` router a higher priority than the frontend host-only
  router

Practical priority guidance:

- Frontend router priority in this repo: `10`
- Backend `/api` router priority: any higher value, for example `100`

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
