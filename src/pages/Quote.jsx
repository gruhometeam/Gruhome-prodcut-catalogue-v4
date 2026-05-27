import { useState, useMemo, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Plus } from 'lucide-react';
import { formatINR, inferCategory, UNIT_BY_CATEGORY } from '../utils/format';
import { H } from '../utils/hindi';
import ShareModal from '../components/ShareModal';
import { CartContext } from '../App';

const CATEGORIES = ['Curtain Fabric', 'Upholstery', 'Wallpaper', 'Blinds'];

const PER_PANEL = {
  'channel-max': 22, 'channel-less': 26,
  'rod-max': 26,     'rod-less': 34,
};

// ── Math functions ─────────────────────────────────────────────
function computeCurtain(price, m) {
  const perPanelIn = PER_PANEL[`${m.installation}-${m.fullness}`];
  const panels = Math.max(1, Math.ceil((m.wallWidthFt * 12) / perPanelIn));
  const metresPerPanel = Math.ceil(((m.wallHeightFt * 12 + 15) / 39) * 10) / 10;
  const totalMetres = +(panels * metresPerPanel).toFixed(2);
  const fabricCost = Math.round(totalMetres * price);
  const stitchingCost = panels * m.stitchingPerPanel;
  return {
    lines: [
      { label: `Per-panel width`,  value: `${perPanelIn}" · ${m.installation}, ${m.fullness}` },
      { label: `Per-panel length`, value: `${metresPerPanel} m` },
      { label: `Panels`,           value: `${panels}` },
      { label: `Total fabric`,     value: `${totalMetres} m` },
      { label: `Fabric @ ${formatINR(price)}/m`, value: formatINR(fabricCost) },
      { label: `Stitching · ${panels} × ${formatINR(m.stitchingPerPanel)}`, value: formatINR(stitchingCost) },
    ],
    materials: fabricCost,
    labor: stitchingCost,
    summaryLabel: `${m.wallWidthFt}×${m.wallHeightFt} ft · ${m.installation} · ${panels} panels · ${totalMetres} m`,
  };
}

function computeRoman(price, m) {
  const blindWidthIn  = m.wallWidthFt * 12;
  const blindHeightIn = m.wallHeightFt * 12;
  const usableWidthIn = m.fabricWidthIn - m.widthMarginIn;
  const lengths = Math.max(1, Math.ceil(blindWidthIn / usableWidthIn));
  const metresPerLength = Math.ceil(((blindHeightIn + 10) / 39) * 10) / 10;
  const totalMetres = +(lengths * metresPerLength).toFixed(2);
  const fabricCost = Math.round(totalMetres * price);
  const makingCost = Math.round(m.wallWidthFt * m.wallHeightFt * m.makingRate);
  return {
    lines: [
      { label: `Blind size`,   value: `${blindWidthIn}"×${blindHeightIn}"` },
      { label: `Usable width`, value: `${usableWidthIn}"` },
      { label: `Lengths`,      value: `${lengths}` },
      { label: `Total fabric`, value: `${totalMetres} m` },
      { label: `Fabric @ ${formatINR(price)}/m`, value: formatINR(fabricCost) },
      { label: `Making @ ${formatINR(m.makingRate)}/sq.ft`, value: formatINR(makingCost) },
    ],
    materials: fabricCost,
    labor: makingCost,
    summaryLabel: `Roman ${m.wallWidthFt}×${m.wallHeightFt} ft · ${totalMetres} m`,
  };
}

function computeFabricOnly(price, m) {
  const cost = Math.round(m.metres * price);
  return {
    lines: [{ label: `${m.metres} m × ${formatINR(price)}/m`, value: formatINR(cost) }],
    materials: cost, labor: 0,
    summaryLabel: `${m.metres} m fabric`,
  };
}

function computeUpholstery(price, m) {
  const cost = Math.round(m.metres * price);
  return {
    lines: [{ label: `${m.metres} m × ${formatINR(price)}/m`, value: formatINR(cost) }],
    materials: cost, labor: 0,
    summaryLabel: `${m.metres} m fabric`,
  };
}

function computeWallpaper(price, m) {
  const wallSqft = m.wallWidthFt * m.wallHeightFt;
  const coverage = m.designType === 'complex' ? 40 : 50;
  const rolls = Math.max(1, Math.ceil(wallSqft / coverage));
  const cost = rolls * price;
  return {
    lines: [
      { label: `Wall area`,   value: `${wallSqft.toFixed(0)} sq.ft` },
      { label: `Coverage`,    value: `${coverage} sq.ft/roll · ${m.designType}` },
      { label: `${rolls} roll${rolls > 1 ? 's' : ''} × ${formatINR(price)}`, value: formatINR(cost) },
    ],
    materials: cost, labor: 0,
    summaryLabel: `${m.wallWidthFt}×${m.wallHeightFt} ft · ${rolls} roll${rolls > 1 ? 's' : ''}`,
  };
}

function computeBlind(price, m) {
  const sqft = m.widthFt * m.heightFt;
  const cost = Math.round(sqft * price);
  return {
    lines: [
      { label: `${m.widthFt}×${m.heightFt} ft`, value: `${sqft.toFixed(1)} sq.ft` },
      { label: `@ ${formatINR(price)}/sq.ft`,    value: formatINR(cost) },
    ],
    materials: cost, labor: 0,
    summaryLabel: `${m.widthFt}×${m.heightFt} ft · ${sqft.toFixed(1)} sq.ft`,
  };
}

function generateQQN() {
  const now = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const xxxx = String(Math.floor(1000 + Math.random() * 9000));
  return `GH-${dd}${mm}-${xxxx}`;
}

// ── UI primitives ──────────────────────────────────────────────
function HiLabel({ text }) {
  return <span className="text-[9px] text-[#2B2B2B]/30 block leading-none mt-0.5">{text}</span>;
}

function StepBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-lg border border-[#C8C2B8] bg-[#FBF5E5] text-[#2B2B2B] text-lg font-semibold flex items-center justify-center">
      {children}
    </button>
  );
}

function NumberRow({ label, hindiKey, unit, value, step = 1, min = 0, onChange, hindiOn }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#C8C2B8]/30 last:border-0">
      <div>
        <span className="text-[13.5px] font-medium text-[#2B2B2B]">{label}</span>
        {hindiOn && hindiKey && H[hindiKey] && <HiLabel text={H[hindiKey]} />}
      </div>
      <div className="flex items-center gap-2">
        <StepBtn onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>−</StepBtn>
        <div className="min-w-[80px] text-center text-[15px] font-semibold text-[#2B2B2B] tabular-nums">
          {value} <span className="text-[11px] font-normal text-[#2B2B2B]/40">{unit}</span>
        </div>
        <StepBtn onClick={() => onChange(+(value + step).toFixed(2))}>+</StepBtn>
      </div>
    </div>
  );
}

function RadioRow({ label, hindiKey, value, options, onChange, hindiOn }) {
  return (
    <div className="flex flex-col gap-1.5 py-2.5 border-b border-[#C8C2B8]/30 last:border-0">
      <div>
        <span className="text-[13.5px] font-medium text-[#2B2B2B]">{label}</span>
        {hindiOn && hindiKey && H[hindiKey] && <HiLabel text={H[hindiKey]} />}
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map(o => {
          const active = value === o.v;
          return (
            <button key={o.v} onClick={() => onChange(o.v)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${active ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'border-[#C8C2B8] text-[#2B2B2B]'}`}>
              {o.l}
              {hindiOn && H[o.l] && <span className="block text-[9px] opacity-70 leading-none mt-0.5">{H[o.l]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, hindiKey, subtitle, children, hindiOn }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">
          {title}
          {hindiOn && hindiKey && H[hindiKey] && (
            <span className="ml-1.5 normal-case tracking-normal font-normal text-[#2B2B2B]/25">{H[hindiKey]}</span>
          )}
        </div>
        {subtitle && <div className="text-[11px] text-[#2B2B2B]/40 mt-1 italic">{subtitle}</div>}
      </div>
      <div className="bg-white border border-[#C8C2B8]/50 rounded-xl px-3 py-1">{children}</div>
    </div>
  );
}

function SegControl({ value, options, onChange, hindiOn }) {
  return (
    <div className="flex bg-[#FBF5E5] border border-[#C8C2B8]/50 rounded-xl p-0.5">
      {options.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all flex flex-col items-center ${active ? 'bg-white text-[#2B2B2B] shadow-sm' : 'text-[#2B2B2B]/55'}`}>
            {o.l}
            {hindiOn && H[o.l] && <span className="text-[9px] font-normal text-[#2B2B2B]/30 leading-none mt-0.5">{H[o.l]}</span>}
          </button>
        );
      })}
    </div>
  );
}

function DiscountStrip({ value, options, onChange }) {
  return (
    <div className="flex bg-[#FBF5E5] border border-[#C8C2B8]/50 rounded-xl p-0.5">
      {options.map(v => {
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-[10px] text-[12.5px] tabular-nums transition-all ${active ? 'bg-[#8A9A5B] text-white font-bold shadow-sm' : 'font-medium text-[#2B2B2B]'}`}>
            {v}%
          </button>
        );
      })}
    </div>
  );
}

// ── Main Quote screen ─────────────────────────────────────────
export default function Quote() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { addToCart, showToast, hindiOn } = useContext(CartContext);
  const product = state?.product;

  const [qqn]      = useState(generateQQN);
  const [category, setCategory] = useState(() => product ? inferCategory(product) : 'Curtain Fabric');
  const [mode, setMode]         = useState('curtain');
  const [fabricSku, setFabricSku] = useState('');

  const [curtain, setCurtain]   = useState({ wallWidthFt: 5, wallHeightFt: 8, installation: 'channel', fullness: 'max', stitchingPerPanel: 375 });
  const [roman, setRoman]       = useState({ wallWidthFt: 4, wallHeightFt: 5, widthMarginIn: 5, fabricWidthIn: 54, makingRate: 150 });
  const [fabricOnly, setFabricOnly] = useState({ metres: 3 });
  const [upholstery, setUpholstery] = useState({ metres: 5 });
  const [wallpaper, setWallpaper]   = useState({ wallWidthFt: 12, wallHeightFt: 10, designType: 'simple' });
  const [blind, setBlind]           = useState({ widthFt: 4, heightFt: 5 });
  const [discount, setDiscount] = useState(0);
  const [shareCard, setShareCard] = useState(null);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-[#2B2B2B]/55 mb-4">No product selected.</p>
          <button onClick={() => navigate('/')} className="text-[#8A9A5B] font-semibold">← Browse catalog</button>
        </div>
      </div>
    );
  }

  const price      = parseFloat(product['RRP']) || 0;
  const designName = product['DESIGN NAME'] || product['DESIGN NAME ALT'] || 'Unknown';
  const brandName  = product['BRAND NAME'] || '';
  const bookName   = product['BOOK NAME'] || '';
  const priceCode  = product['PRICE CODE'] || '';

  const isCurtain    = category === 'Curtain Fabric';
  const isUpholstery = category === 'Upholstery';
  const isWallpaper  = category === 'Wallpaper';
  const isBlind      = category === 'Blinds';

  const computed = useMemo(() => {
    if (isCurtain && mode === 'curtain') return computeCurtain(price, curtain);
    if (isCurtain && mode === 'roman')   return computeRoman(price, roman);
    if (isCurtain && mode === 'fabric')  return computeFabricOnly(price, fabricOnly);
    if (isUpholstery) return computeUpholstery(price, upholstery);
    if (isWallpaper)  return computeWallpaper(price, wallpaper);
    if (isBlind)      return computeBlind(price, blind);
    return { lines: [], materials: 0, labor: 0, summaryLabel: '' };
  }, [category, mode, curtain, roman, fabricOnly, upholstery, wallpaper, blind, price]);

  const discountAmount = Math.round(computed.materials * (discount / 100));
  const total          = Math.round(computed.materials + computed.labor - discountAmount);

  const modeLabel = isCurtain
    ? (mode === 'curtain' ? 'Curtain' : mode === 'roman' ? 'Roman blind' : 'Fabric only')
    : category;

  const buildShareCard = () => {
    const skuLine = fabricSku.trim() ? `SKU: ${fabricSku.trim()}` : null;
    const text = [
      `*Gruhome — Quick Quote*`,
      `Ref: ${qqn}`,
      ``,
      `${designName}  ·  ${brandName}`,
      bookName  && `Book: ${bookName}`,
      priceCode && `Catalog code: ${priceCode}`,
      skuLine,
      ``,
      `*${modeLabel}*`,
      ...computed.lines.map(l => `${l.label}: ${l.value}`),
      discount > 0 ? `Discount (${discount}%): − ${formatINR(discountAmount)}` : null,
      ``,
      `*Total: ${formatINR(total)}*`,
      ``,
      `_All prices inclusive of GST · Indicative, subject to final measurement._`,
    ].filter(Boolean).join('\n');

    const lines = [
      ...computed.lines.map(l => ({ label: l.label, value: l.value })),
      ...(discount > 0 ? [{ label: `Discount (${discount}%)`, value: `− ${formatINR(discountAmount)}` }] : []),
    ];
    if (skuLine) lines.unshift({ label: 'Fabric SKU', value: fabricSku.trim(), mono: true });

    return {
      title: designName,
      subtitle: `${brandName}${bookName ? '  ·  ' + bookName : ''}`,
      badge: modeLabel,
      lines,
      priceLabel: 'Estimated total',
      priceValue: formatINR(total),
      priceUnit: '',
      footer: `Ref: ${qqn}  ·  All prices incl. GST`,
      text,
    };
  };

  const handleAddToCart = () => {
    addToCart({
      product,
      qqn,
      category,
      mode: modeLabel,
      summary: computed.summaryLabel,
      discount,
      computed,
      total,
    });
    navigate('/cart');
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
    showToast('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#F4ECD8] pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-[#F4ECD8] z-10 flex items-center justify-between px-4 py-3 border-b border-[#C8C2B8]/40">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-[#C8C2B8] flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#2B2B2B]" />
        </button>
        <div className="text-center">
          <span className="font-serif text-xl font-semibold text-[#2B2B2B]">Quick Quote</span>
          <div className="text-[10px] text-[#2B2B2B]/40 font-mono tracking-wide">{qqn}</div>
        </div>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Selected product */}
        <div className="bg-white border border-[#C8C2B8]/50 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-serif text-lg font-semibold text-[#2B2B2B] leading-tight truncate">{designName}</div>
            <div className="text-[11.5px] text-[#2B2B2B]/55 mt-0.5 truncate">
              {brandName}{bookName ? `  ·  ${bookName}` : ''}{priceCode ? `  ·  ${priceCode}` : ''}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[#8A9A5B] font-bold text-lg tabular-nums">{formatINR(price)}</div>
            <div className="text-[9.5px] text-[#2B2B2B]/35">{UNIT_BY_CATEGORY[category]} · incl. GST</div>
          </div>
        </div>

        {/* Optional fabric SKU */}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">
            Fabric SKU / Serial No. <span className="normal-case tracking-normal font-normal text-[#2B2B2B]/30">(optional)</span>
          </label>
          <input
            type="text"
            value={fabricSku}
            onChange={e => setFabricSku(e.target.value)}
            placeholder="e.g. DD-0421 (written on fabric back)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C8C2B8] text-[#2B2B2B] text-[13.5px] font-mono placeholder-[#2B2B2B]/25 outline-none"
          />
        </div>

        {/* Category picker */}
        <div className="flex flex-col gap-2">
          <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">
            Category
            {hindiOn && <span className="ml-1.5 normal-case tracking-normal font-normal text-[#2B2B2B]/25">{H['Category']}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`py-2.5 px-3 rounded-xl text-[13px] font-medium border text-left transition-colors ${category === cat ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'bg-white border-[#C8C2B8] text-[#2B2B2B]'}`}>
                {cat}
                {hindiOn && H[cat] && <span className="block text-[9px] opacity-70 leading-none mt-0.5">{H[cat]}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle for curtain fabric */}
        {isCurtain && (
          <SegControl hindiOn={hindiOn} value={mode} onChange={setMode}
            options={[{ v: 'curtain', l: 'Curtain' }, { v: 'roman', l: 'Roman' }, { v: 'fabric', l: 'Fabric only' }]} />
        )}

        {/* ── Forms ── */}
        {isCurtain && mode === 'curtain' && (
          <>
            <Section title="Window" hindiKey="Window" hindiOn={hindiOn}>
              <NumberRow label="Wall width"  hindiKey="Wall width"  unit="ft" value={curtain.wallWidthFt}  step={0.5} hindiOn={hindiOn} onChange={v => setCurtain({ ...curtain, wallWidthFt: v })} />
              <NumberRow label="Wall height" hindiKey="Wall height" unit="ft" value={curtain.wallHeightFt} step={0.5} hindiOn={hindiOn} onChange={v => setCurtain({ ...curtain, wallHeightFt: v })} />
            </Section>
            <Section title="Installation" hindiKey="Installation" hindiOn={hindiOn}>
              <RadioRow label="Type"     hindiKey="Type"     value={curtain.installation} hindiOn={hindiOn}
                options={[{ v: 'channel', l: 'Channel' }, { v: 'rod', l: 'Rod' }]}
                onChange={v => setCurtain({ ...curtain, installation: v })} />
              <RadioRow label="Fullness" hindiKey="Fullness" value={curtain.fullness} hindiOn={hindiOn}
                options={[{ v: 'max', l: 'Max' }, { v: 'less', l: 'Less' }]}
                onChange={v => setCurtain({ ...curtain, fullness: v })} />
            </Section>
            <Section title="Stitching" hindiKey="Stitching" hindiOn={hindiOn}>
              <RadioRow label="Per panel" hindiKey="Per panel" value={curtain.stitchingPerPanel} hindiOn={hindiOn}
                options={[{ v: 350, l: '₹350' }, { v: 375, l: '₹375' }]}
                onChange={v => setCurtain({ ...curtain, stitchingPerPanel: v })} />
            </Section>
          </>
        )}
        {isCurtain && mode === 'roman' && (
          <>
            <Section title="Window" hindiKey="Window" hindiOn={hindiOn}>
              <NumberRow label="Width"  hindiKey="Width"  unit="ft" value={roman.wallWidthFt}  step={0.5} hindiOn={hindiOn} onChange={v => setRoman({ ...roman, wallWidthFt: v })} />
              <NumberRow label="Height" hindiKey="Height" unit="ft" value={roman.wallHeightFt} step={0.5} hindiOn={hindiOn} onChange={v => setRoman({ ...roman, wallHeightFt: v })} />
            </Section>
            <Section title="Fabric" hindiKey="Fabric" hindiOn={hindiOn}>
              <RadioRow label="Fabric width" hindiKey="Fabric width" value={roman.fabricWidthIn} hindiOn={hindiOn}
                options={[{ v: 48, l: '48"' }, { v: 54, l: '54"' }]}
                onChange={v => setRoman({ ...roman, fabricWidthIn: v })} />
              <RadioRow label="Side margin" hindiKey="Side margin" value={roman.widthMarginIn} hindiOn={hindiOn}
                options={[{ v: 5, l: '5"' }, { v: 6, l: '6"' }, { v: 7, l: '7"' }, { v: 8, l: '8"' }]}
                onChange={v => setRoman({ ...roman, widthMarginIn: v })} />
            </Section>
            <Section title="Making cost" hindiKey="Making cost" hindiOn={hindiOn}>
              <NumberRow label="Making rate" hindiKey="Making rate" unit="₹/sq.ft" value={roman.makingRate} step={10} min={50} hindiOn={hindiOn} onChange={v => setRoman({ ...roman, makingRate: Math.max(50, v) })} />
              <RadioRow label="Quick set" hindiKey="Quick set" value={roman.makingRate} hindiOn={hindiOn}
                options={[{ v: 100, l: '₹100' }, { v: 125, l: '₹125' }, { v: 150, l: '₹150' }]}
                onChange={v => setRoman({ ...roman, makingRate: v })} />
            </Section>
          </>
        )}
        {isCurtain && mode === 'fabric' && (
          <Section title="Fabric only" hindiKey="Fabric only" subtitle="Customer is buying loose fabric — no stitching or making." hindiOn={hindiOn}>
            <NumberRow label="Metres" hindiKey="Metres" unit="m" value={fabricOnly.metres} step={0.5} min={0.5} hindiOn={hindiOn} onChange={v => setFabricOnly({ metres: v })} />
          </Section>
        )}
        {isUpholstery && (
          <Section title="Fabric needed" hindiKey="Fabric needed" subtitle="Typical 2-seater: 8–10 m. 3-seater: 12–14 m. Chair: 3–4 m." hindiOn={hindiOn}>
            <NumberRow label="Metres" hindiKey="Metres" unit="m" value={upholstery.metres} step={0.5} hindiOn={hindiOn} onChange={v => setUpholstery({ metres: v })} />
          </Section>
        )}
        {isWallpaper && (
          <>
            <Section title="Wall measurements" hindiKey="Wall measurements" hindiOn={hindiOn}>
              <NumberRow label="Width"  hindiKey="Width"  unit="ft" value={wallpaper.wallWidthFt}  step={0.5} hindiOn={hindiOn} onChange={v => setWallpaper({ ...wallpaper, wallWidthFt: v })} />
              <NumberRow label="Height" hindiKey="Height" unit="ft" value={wallpaper.wallHeightFt} step={0.5} hindiOn={hindiOn} onChange={v => setWallpaper({ ...wallpaper, wallHeightFt: v })} />
            </Section>
            <Section title="Coverage per roll" hindiKey="Coverage per roll" hindiOn={hindiOn}>
              <RadioRow label="Design type" hindiKey="Design type" value={wallpaper.designType} hindiOn={hindiOn}
                options={[{ v: 'simple', l: 'Simple / texture · 50 sq.ft' }, { v: 'complex', l: 'Complex pattern · 40 sq.ft' }]}
                onChange={v => setWallpaper({ ...wallpaper, designType: v })} />
            </Section>
          </>
        )}
        {isBlind && (
          <Section title="Window measurements" hindiKey="Window measurements" hindiOn={hindiOn}>
            <NumberRow label="Width"  hindiKey="Width"  unit="ft" value={blind.widthFt}  step={0.5} hindiOn={hindiOn} onChange={v => setBlind({ ...blind, widthFt: v })} />
            <NumberRow label="Height" hindiKey="Height" unit="ft" value={blind.heightFt} step={0.5} hindiOn={hindiOn} onChange={v => setBlind({ ...blind, heightFt: v })} />
          </Section>
        )}

        {/* Discount */}
        <div className="flex flex-col gap-2">
          <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">
            Discount
            {hindiOn && <span className="ml-1.5 normal-case tracking-normal font-normal text-[#2B2B2B]/25">{H['Discount']}</span>}
          </div>
          <div className="text-[11px] text-[#2B2B2B]/40 italic -mt-1">Applies to materials only — not stitching or making.</div>
          <DiscountStrip value={discount} options={[0, 10, 15, 20, 25, 30]} onChange={setDiscount} />
        </div>

        {/* Breakdown */}
        <div className="bg-white border border-[#C8C2B8] rounded-xl px-4 py-3.5 flex flex-col gap-2.5">
          {computed.lines.map((l, i) => (
            <div key={i} className="flex justify-between items-baseline gap-2">
              <span className="text-[12.5px] text-[#2B2B2B]/55">{l.label}</span>
              <span className="text-[13px] text-[#2B2B2B] font-medium tabular-nums">{l.value}</span>
            </div>
          ))}
          {discount > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="text-[12.5px] text-[#2B2B2B]/55">Discount on materials ({discount}%)</span>
              <span className="text-[13px] text-[#8A9A5B] font-semibold tabular-nums">− {formatINR(discountAmount)}</span>
            </div>
          )}
          <div className="h-px bg-[#C8C2B8]/30 my-1" />
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Estimated total</span>
            <div className="text-right">
              <div className="text-[#8A9A5B] font-bold text-2xl tabular-nums">{formatINR(total)}</div>
              <div className="text-[9.5px] text-[#2B2B2B]/35">incl. GST</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleAddToCart}
            className="flex-[1.4] h-12 rounded-xl bg-[#8A9A5B] text-white font-semibold text-[14px] flex items-center justify-center gap-2">
            <Plus size={16} /> Add to cart
          </button>
          <button onClick={() => setShareCard(buildShareCard())}
            className="flex-1 h-12 rounded-xl bg-white border border-[#C8C2B8] text-[#2B2B2B] font-semibold text-[14px] flex items-center justify-center gap-2">
            <Share2 size={16} /> Share
          </button>
        </div>
        <p className="text-[11px] text-[#2B2B2B]/35 text-center">
          All prices incl. GST · Indicative, subject to final measurement.
        </p>
      </div>

      {shareCard && (
        <ShareModal
          card={shareCard}
          onCopy={() => copyToClipboard(shareCard.text)}
          onClose={() => setShareCard(null)}
        />
      )}
    </div>
  );
}
