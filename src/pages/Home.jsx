import { useState, useMemo, useRef, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import MultiFilterBar from '../components/MultiFilterBar';
import ShareModal from '../components/ShareModal';
import { X, LayoutGrid, List, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { formatINR } from '../utils/format';
import { CartContext } from '../App';

// ── Sort chip with popover ─────────────────────────────────────
const SORT_OPTIONS = [
  { id: 'name-asc',   label: 'Name A → Z' },
  { id: 'price-asc',  label: 'Price low → high' },
  { id: 'price-desc', label: 'Price high → low' },
];

function SortChip({ sort, onSort }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const label = SORT_OPTIONS.find(s => s.id === sort)?.label ?? 'Sort';

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium border border-white/10 bg-[#252527] text-white whitespace-nowrap"
      >
        <SlidersHorizontal size={13} /> {label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl z-30 py-1 min-w-[180px]">
          {SORT_OPTIONS.map(s => (
            <button key={s.id} onClick={() => { onSort(s.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[13.5px] font-medium hover:bg-white/[0.06] ${sort === s.id ? 'text-[#C5DE7A] font-semibold' : 'text-white'}`}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Price range chip with popover ─────────────────────────────
const PRESETS = [
  { label: 'Any',          min: null, max: null  },
  { label: 'Under ₹500',   min: null, max: 500   },
  { label: '₹500–1,000',   min: 500,  max: 1000  },
  { label: '₹1,000–2,000', min: 1000, max: 2000  },
  { label: '₹2,000–5,000', min: 2000, max: 5000  },
  { label: 'Above ₹5,000', min: 5000, max: null  },
];

function PriceChip({ priceRange, onChange, priceBounds }) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(priceRange.min ?? '');
  const [max, setMax] = useState(priceRange.max ?? '');
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  useEffect(() => { setMin(priceRange.min ?? ''); setMax(priceRange.max ?? ''); }, [priceRange.min, priceRange.max]);

  const apply = (mn, mx) => onChange({
    min: mn === '' || mn == null ? null : Number(mn),
    max: mx === '' || mx == null ? null : Number(mx),
  });

  const active = priceRange.min != null || priceRange.max != null;
  const chipLabel = active
    ? `${priceRange.min != null ? '₹' + priceRange.min : '₹0'} – ${priceRange.max != null ? '₹' + priceRange.max : '∞'}`
    : 'Price';

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium border whitespace-nowrap ${active ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'border-white/10 bg-[#1C1C1E] text-white'}`}>
        {chipLabel}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl z-30 p-4 min-w-[240px]">
          <div className="text-[10.5px] uppercase tracking-widest font-bold text-white/40 mb-3">Price range (MRP)</div>
          <div className="flex gap-2 items-end mb-3">
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-white/40">Min ₹</span>
              <input type="number" inputMode="numeric" value={min} placeholder="0"
                onChange={e => { setMin(e.target.value); apply(e.target.value, max); }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#252527] text-[13.5px] font-semibold text-white outline-none tabular-nums" />
            </div>
            <span className="text-white/40 text-sm pb-1.5">—</span>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-white/40">Max ₹</span>
              <input type="number" inputMode="numeric" value={max} placeholder="∞"
                onChange={e => { setMax(e.target.value); apply(min, e.target.value); }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#252527] text-[13.5px] font-semibold text-white outline-none tabular-nums" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => {
              const isActive = (priceRange.min ?? null) === p.min && (priceRange.max ?? null) === p.max;
              return (
                <button key={p.label} onClick={() => { setMin(p.min ?? ''); setMax(p.max ?? ''); apply(p.min, p.max); }}
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium border ${isActive ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'border-white/10 text-white'}`}>
                  {p.label}
                </button>
              );
            })}
          </div>
          {priceBounds && (
            <div className="text-[10.5px] text-white/35 mt-2">
              Catalog: {formatINR(priceBounds.min)} – {formatINR(priceBounds.max)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Explicit filter whitelist — only columns with meaningful, bounded cardinality.
// Defined at module level so it is never recreated inside the render cycle.
const FILTER_KEYS = ['BRAND NAME', 'BOOK NAME'];

// ── Home page ─────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { hindiOn, toggleHindi } = useContext(CartContext);
  const { products, headers, loading, error, retry } = useProducts();
  const [searchInput, setSearchInput] = useState('');   // immediate — drives the input
  const [search, setSearch] = useState('');              // debounced — drives the filter
  const searchTimer = useRef(null);
  const handleSearch = useCallback((val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 250);
  }, []);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('name-asc');
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [layout, setLayout] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shareCard, setShareCard] = useState(null);
  const handleSelect = useCallback((p) => setSelectedProduct(p), []);

  const filterSpecs = useMemo(() => {
    if (!products?.length) return [];
    return FILTER_KEYS.map(key => {
      const seen = new Set();
      for (const p of products) {
        const v = p[key];
        if (v != null && v !== '' && v !== '0' && v !== 'N/A') seen.add(v.toString().trim());
      }
      const options = Array.from(seen).sort();
      return options.length > 1 ? { key, label: key, options } : null;
    }).filter(Boolean);
  }, [products]);

  const priceBounds = useMemo(() => {
    const nums = products.map(p => parseFloat(p['MRP'])).filter(n => !isNaN(n));
    if (!nums.length) return null;
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }, [products]);

  // Pre-index each row into one lowercased search blob, computed once per
  // products change. Each keystroke then does a single string includes()
  // per row instead of scanning every field object — ~10x fewer ops at scale.
  // Terms never contain whitespace (split on \s+), so the space-joined blob
  // matches identically to the old per-field scan.
  const searchBlobs = useMemo(
    () => products.map(p => Object.values(p).join(' ').toLowerCase()),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let list = products.filter((p, i) => {
      const matchesSearch = searchTerms.every(term => searchBlobs[i].includes(term));
      const matchesFilters = Object.entries(filters).every(([key, values]) => {
        if (!values || (Array.isArray(values) && !values.length)) return true;
        const pVal = p[key]?.toString().trim();
        if (!pVal) return false;
        return (Array.isArray(values) ? values : [values]).includes(pVal);
      });
      return matchesSearch && matchesFilters;
    });

    // Price range filter
    if (priceRange.min != null) list = list.filter(p => parseFloat(p['MRP']) >= priceRange.min);
    if (priceRange.max != null) list = list.filter(p => parseFloat(p['MRP']) <= priceRange.max);

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => parseFloat(a['MRP']) - parseFloat(b['MRP']));
    else if (sort === 'price-desc') list.sort((a, b) => parseFloat(b['MRP']) - parseFloat(a['MRP']));
    else list.sort((a, b) => (a['DESIGN NAME'] ?? '').toString().localeCompare((b['DESIGN NAME'] ?? '').toString()));

    return list;
  }, [products, searchBlobs, search, filters, sort, priceRange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const cur = Array.isArray(prev[key]) ? prev[key] : prev[key] ? [prev[key]] : [];
      if (value === null) { const n = { ...prev }; delete n[key]; return n; }
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      if (!next.length) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: next };
    });
  };

  const clearAll = () => { setFilters({}); setPriceRange({ min: null, max: null }); };

  const activeCount = Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0)
    + (priceRange.min != null || priceRange.max != null ? 1 : 0);

  const buildProductShareCard = (product) => {
    const design = product['DESIGN NAME'] || product['DESIGN NAME ALT'] || 'Unknown';
    const brand = product['BRAND NAME'] || '';
    const book = product['BOOK NAME'] || '';
    const mrp = parseFloat(product['MRP']) || 0;
    const code = product['PRICE CODE'] || '';
    const text = [
      `*Gruhome*  ·  ${design}`,
      brand,
      book && `Book: ${book}`,
      code && `Code: ${code}`,
      ``,
      `*MRP: ${formatINR(mrp)} per metre*`,
      ``,
      `_All prices inclusive of GST · Subject to availability._`,
    ].filter(Boolean).join('\n');
    return {
      title: design,
      subtitle: [brand, book].filter(Boolean).join('  ·  '),
      lines: [
        book  && { label: 'Book',       value: book },
        code  && { label: 'Price code', value: code, mono: true },
      ].filter(Boolean),
      priceLabel: 'MRP',
      priceValue: formatINR(mrp),
      priceUnit: 'per metre',
      footer: 'All prices inclusive of GST · Subject to availability.',
      text,
    };
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      } catch (_) {}
    }
  };

  if (error && !products.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#111111]">
        <h2 className="font-serif text-[32px] mb-4 text-white">Catalog Unavailable</h2>
        <button onClick={retry} className="bg-[#8A9A5B] text-white px-8 py-3 rounded-full font-bold shadow-lg">
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] pb-28 overflow-x-hidden selection:bg-[#C5DE7A]/20">
      <div className="w-[96%] mx-auto py-8">
        <header className="mb-6 flex flex-col gap-4">
          {/* Title + Hindi toggle + count */}
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-[48px] text-white leading-none">Gruhome</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleHindi}
                title={hindiOn ? 'Hindi labels ON' : 'Hindi labels OFF'}
                className={`text-[13px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${hindiOn ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'border-white/10 text-white/45 bg-[#1C1C1E]'}`}
              >
                हि
              </button>
              <span className="text-[11.5px] text-white/55 tabular-nums">
                {filteredProducts.length} of {products.length}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="w-full bg-[#1C1C1E] rounded-[12px] border border-white/10 shadow-sm overflow-hidden h-[64px] flex items-center">
            <SearchBar value={searchInput} onChange={handleSearch} placeholder="Search design, brand, book…" />
          </div>

          {/* Sort + Price + Layout toggle row */}
          <div className="flex items-center gap-2">
            <SortChip sort={sort} onSort={setSort} />
            <PriceChip priceRange={priceRange} onChange={setPriceRange} priceBounds={priceBounds} />
            <div className="flex gap-1 ml-auto flex-shrink-0">
              <button onClick={() => setLayout('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${layout === 'grid' ? 'bg-[#8A9A5B] border-[#8A9A5B] text-white' : 'border-white/10 bg-[#1C1C1E] text-white/55'}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setLayout('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${layout === 'list' ? 'bg-[#8A9A5B] border-[#8A9A5B] text-white' : 'border-white/10 bg-[#1C1C1E] text-white/55'}`}>
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Filter chips + clear */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <MultiFilterBar filterSpecs={filterSpecs} selectedFilters={filters} onFilterChange={handleFilterChange} />
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll}
                className="flex-shrink-0 text-[11px] uppercase tracking-wider text-[#C5DE7A] font-bold px-2">
                Clear {activeCount}
              </button>
            )}
          </div>
        </header>

        {/* Product grid / list */}
        {loading && !products.length ? (
          <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-3'}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`bg-[#1C1C1E] rounded-[12px] animate-pulse border border-white/[0.08] ${layout === 'grid' ? 'h-[240px]' : 'h-16'}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-[24px] text-white/30 italic">No matches in our collection</p>
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.slice(0, 150).map((product, i) => (
              <ProductCard key={i} product={product} headers={headers} layout="grid" onSelect={handleSelect} />
            ))}
            {filteredProducts.length > 150 && (
              <div className="col-span-full text-center py-6 text-[13px] text-white/40">
                Showing 150 of {filteredProducts.length} — search or filter to narrow
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredProducts.slice(0, 150).map((product, i) => (
              <ProductCard key={i} product={product} headers={headers} layout="list" onSelect={handleSelect} />
            ))}
            {filteredProducts.length > 150 && (
              <div className="text-center py-6 text-[13px] text-white/40">
                Showing 150 of {filteredProducts.length} — search or filter to narrow
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] px-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#1C1C1E] rounded-2xl w-full max-w-[90%] md:max-w-[560px] max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky modal header */}
            <div className="sticky top-0 bg-[#1C1C1E] border-b border-white/[0.06] flex justify-between items-start px-6 pt-5 pb-4 z-10">
              <h2 className="font-serif text-[28px] text-white leading-tight pr-6">
                {selectedProduct['DESIGN NAME'] || selectedProduct[headers?.[0]]}
              </h2>
              <button onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-white/[0.06] rounded-full transition-colors text-white/35 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fields */}
            <div className="px-6 py-4 space-y-5 flex-1 overflow-y-auto">
              {headers?.map(header => {
                const value = selectedProduct[header];
                if (!value || value === '0' || value === 'N/A') return null;
                const h = header.toLowerCase();
                const isPrice = !isNaN(parseFloat(value.toString().replace(/[^0-9.]/g, ''))) &&
                  (h.includes('price') || h.includes('rrp') || h.includes('mrp') || h.includes('rate'));
                return (
                  <div key={header} className="flex flex-col gap-1 border-b border-white/[0.04] pb-4 last:border-0">
                    <span className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold">{header}</span>
                    <span className={`text-[18px] font-medium ${isPrice ? 'text-[#C5DE7A] font-bold' : 'text-white'}`}>
                      {isPrice
                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
                            .format(parseFloat(value.toString().replace(/[^0-9.]/g, '')))
                        : value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sticky action bar */}
            <div className="sticky bottom-0 bg-[#1C1C1E] border-t border-white/[0.06] px-6 py-4 flex gap-3">
              <button
                onClick={() => { const card = buildProductShareCard(selectedProduct); setSelectedProduct(null); setShareCard(card); }}
                className="flex-1 h-11 rounded-xl bg-[#252527] border border-white/10 text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.06] transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => { setSelectedProduct(null); navigate('/quote', { state: { product: selectedProduct } }); }}
                className="flex-[1.4] h-11 rounded-xl bg-[#8A9A5B] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
              >
                Quick Quote →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareCard && (
        <ShareModal
          card={shareCard}
          onCopy={async () => { await copyToClipboard(shareCard.text); setShareCard(null); }}
          onClose={() => setShareCard(null)}
        />
      )}
    </div>
  );
}
