<h1 align="center">Gruhome Product Catalog</h1>

<p align="center">
  <strong>Internal PWA — staff product lookup and quoting tool for a home-furnishings retailer.</strong><br/>
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

Gruhome sells home furnishings — **curtains, sofa fabric, wallpaper, bedding**. Inventory spans **2,000+ design SKUs** organised across physical swatch books. A **5–7 person sales team** needs to look up a specific design fast while standing on the shop floor with a customer, then generate a quote on the spot.

Before this tool, lookups happened by flipping through a printed catalog or scrolling a Google Sheet on a desktop in the back office. Neither works in the moment a customer asks *"do you have this design in a darker shade?"* or *"how much will it cost to do my living room windows?"*

The tool had to be:
- **In the staff's pocket** — usable on a phone, with one hand, mid-conversation
- **Up to date** — when inventory changes in the sheet, staff see it without a redeploy
- **Offline-tolerant** — retail Wi-Fi isn't always reliable; the tool can't go dark when the connection drops
- **Quote-ready** — staff should be able to generate and share a WhatsApp-friendly quote without leaving the app
- **Zero-friction to install** — no Play Store / App Store gatekeeping for an internal team

---

## What it is

A **Progressive Web App** built in React + Vite. Staff visit a URL once, tap "Add to Home Screen," and from then on it behaves like a native app — full-screen, offline-capable, instantly searchable.

### Core capabilities

**Catalog**
- Search-as-you-type across every product field, multi-word
- Filter by Brand Name and Book Name (multi-select dropdowns)
- Sort by name or MRP (low → high, high → low)
- MRP price range filter with presets
- Grid and list layout toggle
- Product detail modal with all attributes from the row
- Share individual product cards (WhatsApp-friendly text + screenshot-ready visual)

**Quick Quote**
- Calculator for 6 product categories: Curtain (standard / Roman blind / fabric-only), Upholstery, Wallpaper, Blinds
- Fabric SKU / serial number field (optional, prints on quote)
- Discount strip (0–30% on materials only)
- Auto-generated quote reference number (QQN)
- Itemised breakdown with labour and materials split
- Share quote as formatted WhatsApp text + visual screenshot card

**Cart**
- Multi-item cart — add multiple quotes across different products
- Grand total across all items
- Client name field (prints on shared quote)
- Share full multi-item quote as a single message
- Clear cart

**Other**
- Hindi label toggle — secondary Hindi text on all key UI labels (for staff who prefer it)
- Offline cache via service worker + LocalStorage — catalog stays usable without a signal
- Dark theme throughout

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
   ├── useProducts hook  ── fetch + LocalStorage cache fallback
   ├── Home page         ── search, filter, sort, product detail modal
   ├── Quote page        ── category calculator, discount, share
   ├── Cart page         ── multi-item quote, grand total, share
   └── Service worker    ── offline support, auto-update
        │
        ▼
Cloudflare Pages (auto-deploy from main branch)
        │
        ▼
Staff phones (installed as PWA)
```

### Key design decisions

| Decision | Why |
|---|---|
| **Google Sheets as the database** | The store owner already maintains inventory in a sheet. A "real" database would mean the owner edits a CMS instead — a worse workflow. Sheets is the source of truth; the app is a UX layer over it. |
| **Apps Script web endpoint over a server** | No hosting cost, no backend to maintain, no auth surface to secure. The sheet → JSON pipeline is a single deployed script. |
| **MRP as the canonical price** | MRP (Maximum Retail Price) is tax-inclusive and customer-facing. RRP is stored in the sheet for reference but not shown in the UI. |
| **PWA, not a native Android/iOS app** | Avoids Play Store / App Store review, package management, and update friction. Staff install once via a URL. Updates ship instantly. |
| **LocalStorage cache before network fetch** | Shop wifi is unreliable. The cached snapshot renders first; the network fetch refreshes silently when it succeeds. App is usable on a stale cache when offline. |
| **Filter whitelist (`BRAND NAME`, `BOOK NAME` only)** | Dynamic filters across all 10 columns caused 300ms+ lag (DESIGN NAME alone has ~1,800 unique values). Whitelisting 2 meaningful dimensions keeps dropdowns instant. |
| **150-item render cap + 250ms search debounce** | 2,000+ cards in the DOM causes jank on mid-range phones. The cap keeps renders fast; the debounce avoids recomputing filters on every keystroke. |
| **React.memo + useCallback on ProductCard** | Prevents all visible cards from re-rendering when sort/filter dropdowns or modals open — the most impactful single performance fix. |
| **No authentication** | Internal tool, no sensitive pricing data that isn't already in the shop. Auth would add friction with little security gain in this threat model. |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 7 |
| Routing | React Router DOM v7 |
| Styling | TailwindCSS v4 — utility-first, `@theme` variables in `index.css` |
| Icons | lucide-react |
| PWA | `vite-plugin-pwa` (service worker + manifest auto-generated) |
| Data | Google Sheets via Apps Script JSON endpoint |
| Hosting | Cloudflare Pages — auto-deploys from `main` branch |

Accent colour: `#8A9A5B` (sage green). Dark theme palette: `#111111` background, `#1C1C1E` cards, `#C5DE7A` accent on dark surfaces.

---

## Project structure

```
src/
├── components/
│   ├── MultiFilterBar.jsx   # Brand / Book filter chips with multi-select dropdowns
│   ├── ProductCard.jsx      # Grid + list card variants (memoised)
│   ├── SearchBar.jsx        # Controlled search input
│   ├── ShareModal.jsx       # Visual quote card + copy-text action sheet
│   ├── TabBar.jsx           # Bottom nav (Catalog / Cart)
│   └── Toast.jsx            # Ephemeral notification banner
├── hooks/
│   └── useProducts.js       # Fetch + LocalStorage cache logic
├── pages/
│   ├── Cart.jsx             # Multi-item cart + grand total + share
│   ├── Home.jsx             # Catalog — search, filter, sort, detail modal
│   └── Quote.jsx            # Quick Quote calculator
├── utils/
│   ├── format.js            # formatINR, inferCategory, UNIT_BY_CATEGORY
│   └── hindi.js             # Hindi label map
├── App.jsx                  # CartContext provider, routing shell
└── index.css                # Tailwind v4 @theme + global styles
```

---

## Local development

### Prerequisites
- Node.js 18+
- A Google Sheet + Apps Script endpoint returning JSON (see `useProducts.js` for the expected response shape: an array of row objects)

### Install
```bash
npm install
```

### Configure the data source
Edit the `API_URL` constant in `src/hooks/useProducts.js` to point to your Apps Script web app URL.

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm run preview   # optional — preview the production bundle locally
```

The build output in `dist/` deploys to any static host. Cloudflare Pages, Netlify, Vercel, and GitHub Pages all work. The `public/_redirects` file handles SPA routing (`/* /index.html 200`).

---

## Status

Live in production — in daily use by Gruhome staff on the shop floor. The deployed URL is internal to the store's team and not published publicly.

---

## Credits

Built by **Rhythm Jain** with AI assistance, 2026. Designed and shipped solo as a practical tool for a real retail team.
