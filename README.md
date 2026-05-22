<h1 align="center">Gruhome Product Catalog</h1>

<p align="center">
  <strong>Internal PWA — staff product lookup tool for a home-furnishings retailer.</strong><br/>
  Live inventory pulled from Google Sheets, searchable and filterable on any phone, installable like a native app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Type-Internal%20Tool-2E4232?style=flat-square"/>
  <img src="https://img.shields.io/badge/Status-Live%20in%20production-22c55e?style=flat-square"/>
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white"/>
</p>

---

## The problem

Gruhome sells home furnishings — **curtains, sofa fabric, wallpaper, bedding**. Inventory spans **2,000+ design SKUs** organised across physical swatch books. A **5–7 person sales team** needs to look up a specific design fast while standing on the shop floor with a customer.

Before this tool, lookups happened by flipping through a printed catalog or scrolling a Google Sheet on a desktop in the back office. Neither works in the moment a customer asks *"do you have this design in a darker shade?"*

The catalog had to be:
- **In the staff's pocket** — usable on a phone, with one hand, mid-conversation
- **Up to date** — when inventory changes in the sheet, staff should see it without a redeploy
- **Offline-tolerant** — retail Wi-Fi isn't always reliable; the tool can't go dark when the connection drops
- **Zero-friction to install** — no Play Store / App Store gatekeeping for an internal team

---

## What it is

A **Progressive Web App** built in React + Vite. Staff visit a URL once, "Add to Home Screen," and from then on it behaves like a native app — full-screen, offline-capable, instantly searchable across every column in the inventory sheet.

Core capabilities:
- **Search-as-you-type** across every product field, multi-word
- **Dynamic filters** generated from whatever columns exist in the source sheet (design name, collection, colour, material, price band, etc.)
- **Product detail view** showing all attributes from the row
- **Offline cache** via service worker + LocalStorage — once loaded, the catalog stays usable without a signal
- **Installable PWA** — appears on the home screen like a native app, no browser chrome

---

## Architecture

```
Owner's Google Sheet (inventory source of truth)
        │
        ▼
Google Apps Script ── JSON web endpoint
        │
        ▼
React PWA (this repo)
   ├── useProducts hook ── fetch + LocalStorage cache fallback
   ├── Home page       ── search + multi-column filter
   ├── Details page    ── full row as key/value pairs
   └── Service worker  ── offline support, auto-update
        │
        ▼
Staff phones (installed as PWA)
```

### Key design decisions

| Decision | Why |
|---|---|
| **Google Sheets as the database** | The store owner already maintains inventory in a sheet. Adding a "real" database would mean the owner edits a CMS instead of a sheet — a worse workflow for them. Sheets is the source of truth; the app is a UX layer over it. |
| **Apps Script web endpoint over a server** | No hosting cost, no backend to maintain, no auth surface to secure. The sheet → JSON pipeline is a single deployed script. |
| **Schema is fully dynamic — UI adapts to columns** | Owner can add or rename columns in the sheet (e.g. add a "Stock Status" field) and the app picks it up on the next load. No code change, no deploy. |
| **PWA, not a native Android/iOS app** | Avoids Play Store / App Store review, package management, and update friction. Staff install once via a URL. Updates ship instantly. |
| **LocalStorage cache before network fetch** | Shop wifi is unreliable. The cached snapshot renders first; the network fetch refreshes silently when it succeeds. App is usable on a stale cache when offline. |
| **No authentication** | Internal tool, no sensitive data in the catalog. Auth would add friction with little security gain in this threat model. |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 7 |
| Routing | React Router DOM v7 |
| Styling | TailwindCSS 4 — utility-first |
| Icons | lucide-react |
| PWA | `vite-plugin-pwa` (service worker + manifest auto-generated) |
| Data | Google Sheets via Apps Script JSON endpoint |
| Hosting | Static site (the `public/_redirects` file points to a Netlify-style deploy) |

Brand colour: `#2E4232` (deep forest green), set in `tailwind.config.js`.

---

## What's intentionally not in v1

| Cut | Why |
|---|---|
| Authentication / user accounts | Internal tool — friction outweighs benefit |
| Image hosting for swatches | Sheet currently stores text attributes only; image-heavy variant is a v2 if/when needed |
| Server-side search/pagination | Catalog size fits comfortably in memory + LocalStorage on a modern phone |
| Analytics / usage tracking | Not asked for; would need owner consent before adding |
| Multi-language UI | All staff read English; not a constraint to solve yet |

---

## Local development

### Prerequisites
- Node.js 18+
- A Google Sheet + Apps Script endpoint returning JSON (see the existing `useProducts.js` for the expected response shape: an array of row objects)

### Install
```bash
npm install
```

### Configure the data source
Edit the `API_URL` constant in [`src/hooks/useProducts.js`](src/hooks/useProducts.js:3) to point to your Apps Script web app.

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm run preview   # optional — preview the production bundle locally
```

The build output in `dist/` can be deployed to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages, etc.).

---

## Status

Live in production — in daily use by Gruhome staff on the shop floor since launch. The deployed URL is internal to the store's team and not published publicly.

---

## Credits

Built by **Rhythm Jain** with AI assistance, 2026. Designed and shipped solo as a practical tool for a real retail team — not a portfolio exercise.
