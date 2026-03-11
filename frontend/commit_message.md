feat: migrate from Next.js to Vite SPA + add professional motion system and modern doctor sidebar

## Migration & Architecture
- Migrate project from Next.js (App Router) to Vite + React Router SPA
- Replace Next.js routing with React Router v6 + protected routes
- Remove Next-specific APIs (next/image, next/navigation, next/font)
- Replace Next API routes plan with client-side data fetching
- Update env vars from NEXT_PUBLIC_* to VITE_ pattern
- Retain legacy Next files in legacy/ folder for reference

## Motion & Transitions System
- Add framer-motion with prefers-reduced-motion support via MotionProvider
- Implement route-level page transitions:
  - AnimatePresence mode="wait" keyed by pathname
  - PageTransition wrapper using fadeInUp variants (enter: opacity 0->1 + y 12->0, exit: opacity 1->0 + y 0->-8)
  - Duration 250-400ms, easeOut easing
- Split transition strategy:
  - Global transitions for non-doctor routes (welcome, login, signup, etc.)
  - Content-only transitions for doctor routes (sidebar excluded)
- Add reusable motion helpers:
  - fadeIn, fadeInUp, staggerContainer, staggerItem
  - MotionProvider wrapper for reduced motion

## Doctor Layout & Sidebar UX
- Refactor doctor layout to use flex-reserved sidebar (no fixed positioning or padding hacks)
- Implement collapsible sidebar with icons-only mode:
  - Pinned collapsed state (default on first dashboard entry)
  - Hover-to-expand behavior when collapsed (temporary expand on mouse enter, collapse on leave)
  - Single collapse chevron (ChevronsRight) shown only when visually expanded
  - No chevron in icons-only mode for cleaner UX
- Fix hover state handling to prevent state flip during transitions
- Add smooth width transitions (320px <-> 88px) with duration-300

## Code Quality & Cleanup
- Remove unused dependencies and legacy Next configurations
- Add TypeScript motion types and strict wrappers
- Preserve all existing Tailwind styling and UI components
- No breaking changes to component props except sidebar collapse API

## Technical Notes
- Sidebar now reserves space in flex layout (no overlay)
- Page transitions are scoped to content areas to keep sidebar static
- MotionProvider is placed at layout level for doctor routes, global for others
- Reduced motion is respected globally via MotionConfig

## Files Changed
- src/main.tsx: MotionProvider wrapper (removed later, moved to layout)
- src/App.tsx: Conditional route transitions (doctor vs non-doctor)
- src/layout.tsx: Content-only transitions + MotionProvider for doctor area
- src/components/doctor/sidebar.tsx: Full collapse/expand + hover logic
- src/motion/*: New motion helpers and providers
- package.json & config files: Vite migration
- Legacy Next files preserved in legacy/ folder

This commit establishes a modern, animated SPA experience with a professional sidebar UX while preserving all existing functionality and styling.
