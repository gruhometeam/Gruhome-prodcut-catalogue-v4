# Product Catalog PWA

## Overview

This is a Progressive Web App (PWA) built with React and Vite that serves as an internal product catalog for staff. The application fetches product data from a Google Sheet (via JSON API) and displays it in a searchable, filterable interface. Staff can install the app on Android or iOS devices like a native application for quick product lookups.

Key capabilities:
- Search-as-you-type filtering across multiple product fields
- Dynamic filter options extracted from data
- Product cards with essential info and detailed views
- Installable PWA with offline-ready service worker
- No authentication required

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18 with Vite**: Chosen for fast development builds and optimized production bundles. Vite provides near-instant hot module replacement during development.
- **State Management**: React hooks only (useState, useEffect) - no external state library needed given the app's simplicity.

### Styling
- **TailwindCSS 4**: Utility-first CSS framework for rapid UI development with consistent design patterns.
- **Custom Theme**: Primary brand color `#2E4232` (deep forest green) configured in tailwind.config.js.
- **Utility Libraries**: clsx and tailwind-merge for conditional class handling.

### Routing
- **React Router DOM v7**: Client-side routing between Home and Details pages.

### PWA Configuration
- **Vite PWA Plugin**: Handles service worker generation and manifest configuration automatically.
- **Display Mode**: Standalone (appears like native app without browser UI).
- **Auto-Update**: Service worker configured for automatic updates when new versions deploy.

### Data Layer
- **Custom Hook Pattern**: `useProducts.js` encapsulates all data fetching logic.
- **External API**: Fetches JSON from Google Sheet API endpoint (currently placeholder URL).
- **No Local Database**: Data is fetched fresh from the API; caching handled by service worker.

### Component Structure
```
src/
  components/     # Reusable UI components (SearchBar, FilterBar, ProductCard)
  pages/          # Route-level components (Home, Details)
  hooks/          # Custom React hooks (useProducts)
```

### Design Decisions
1. **No Backend Server**: Pure client-side app that directly consumes Google Sheets JSON API - simplifies deployment and maintenance.
2. **PWA-First**: Built for mobile installation from day one, enabling offline access and native-like experience.
3. **Search Implementation**: Client-side filtering across BOOK NAME, DESIGN NAME, DESIGN NAME ALT, and PRICE CODE fields for instant results.

## External Dependencies

### Data Source
- **Google Sheets API**: Product data served as JSON (URL to be configured - currently uses placeholder `https://sheet.best/api/sheets/demo`).

### Third-Party Packages
- **lucide-react**: Icon library for UI elements
- **react-router-dom**: Client-side routing
- **vite-plugin-pwa**: PWA manifest and service worker generation

### Build Tools
- **Vite**: Development server and production bundler
- **PostCSS + Autoprefixer**: CSS processing for browser compatibility

### Required Assets
- PWA icons needed in `/public/icons/`:
  - `icon-192x192.png`
  - `icon-512x512.png`
  - Placeholder design: Letter "G" in white on green (#2E4232) background