import { memo, useCallback } from 'react';
import { formatINR } from '../utils/format';

function formatValue(header, val) {
  if (val === undefined || val === null || val === '') return '';
  const h = header.toLowerCase();
  const isPrice =
    !isNaN(parseFloat(val.toString().replace(/[^0-9.]/g, ''))) &&
    (h.includes('price') || h.includes('rrp') || h.includes('mrp') ||
      h.includes('rate') || h.includes('roll') || h.includes('cut'));
  if (isPrice) {
    const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(num);
  }
  return val;
}

function isHeaderPrice(header) {
  const h = header.toLowerCase();
  return h.includes('price') || h.includes('rrp') || h.includes('mrp') || h.includes('rate');
}

// ── Grid card ─────────────────────────────────────────────────
function CardGrid({ product, headers, onClick }) {
  const displayKeys = headers?.length ? headers : Object.keys(product);
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[14px] p-6 border border-[#C8C2B8]/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col gap-4 [touch-action:manipulation]"
    >
      {displayKeys.map((header, index) => {
        const value = product[header];
        if (value === undefined || value === null || value === '' || value === '0' || value === 'N/A') return null;
        const formatted = formatValue(header, value);
        const isPrice = isHeaderPrice(header);

        if (index === 0) {
          return (
            <h3 key={header} className="font-serif text-[26px] text-[#2B2B2B] leading-tight m-0 font-semibold">
              {formatted}
            </h3>
          );
        }
        return (
          <div key={header} className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[1.5px] text-[#2B2B2B]/40 font-bold">{header}</span>
            <span className={`text-[16px] font-medium leading-snug ${isPrice ? 'text-[#8A9A5B] font-bold' : 'text-[#2B2B2B]'}`}>
              {formatted}
            </span>
            {isPrice && (
              <span className="text-[9.5px] text-[#2B2B2B]/35 font-normal -mt-0.5">incl. GST</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── List card ─────────────────────────────────────────────────
function CardList({ product, headers, onClick }) {
  const designName = product['DESIGN NAME'] || product[headers?.[0]] || 'Unknown';
  const brand = product['BRAND NAME'] || '';
  const book = product['BOOK NAME'] || '';
  const mrp = parseFloat(product['MRP']);
  const sub = [brand, book].filter(Boolean).join('  ·  ');

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl px-4 py-3 border border-[#C8C2B8]/40 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-colors [touch-action:manipulation]"
    >
      <div className="flex-1 min-w-0">
        <div className="font-serif text-[17px] font-semibold text-[#2B2B2B] truncate leading-tight">{designName}</div>
        {sub && <div className="text-[11.5px] text-[#2B2B2B]/50 truncate mt-0.5">{sub}</div>}
      </div>
      {!isNaN(mrp) && (
        <div className="text-right flex-shrink-0">
          <div className="text-[#8A9A5B] font-bold text-[17px] tabular-nums">{formatINR(mrp)}</div>
          <div className="text-[9.5px] text-[#2B2B2B]/35 mt-0.5">incl. GST</div>
        </div>
      )}
    </div>
  );
}

// ── Memoized export — skips re-render when only Home's modal/dropdown
//    state changes; onClick is stabilised via useCallback inside.
export default memo(function ProductCard({ product, headers, onSelect, layout = 'grid' }) {
  const handleClick = useCallback(() => onSelect(product), [onSelect, product]);
  return layout === 'list'
    ? <CardList product={product} headers={headers} onClick={handleClick} />
    : <CardGrid product={product} headers={headers} onClick={handleClick} />;
});
