import { Copy, X } from 'lucide-react';
import { formatINR } from '../utils/format';

export default function ShareModal({ card, onCopy, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card */}
        <div className="bg-white border border-[#C8C2B8] rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#C8C2B8]/30 mb-3">
            <span className="font-serif text-lg font-semibold text-[#2B2B2B]">Gruhome</span>
            {card.badge && (
              <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">{card.badge}</span>
            )}
          </div>

          <div className="mb-3">
            <h3 className="font-serif text-2xl font-semibold text-[#2B2B2B] leading-tight">{card.title}</h3>
            {card.subtitle && <p className="text-[12.5px] text-[#2B2B2B]/55 mt-1">{card.subtitle}</p>}
          </div>

          <div className="flex flex-col gap-1.5 mb-3">
            {card.lines.map((l, i) => {
              if (l.divider) return <div key={i} className="h-px bg-[#C8C2B8]/30 my-1" />;
              if (l.sub) return (
                <div key={i} className="flex justify-between text-[11px] text-[#2B2B2B]/45 pl-3">
                  <span className="flex-1">{l.label}</span>
                  {l.value && <span className={l.discount ? 'text-[#8A9A5B] font-medium' : ''}>{l.value}</span>}
                </div>
              );
              return (
                <div key={i} className="flex justify-between text-[12.5px] gap-3">
                  <span className={`${l.bold ? 'text-[#2B2B2B] font-semibold' : 'text-[#2B2B2B]/55 font-medium'}`}>{l.label}</span>
                  <span className={`${l.bold ? 'text-[#2B2B2B] font-bold' : 'text-[#2B2B2B] font-medium'} text-right ${l.mono ? 'font-mono text-[11px]' : ''}`}>{l.value}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-baseline justify-between pt-3 border-t border-[#C8C2B8]/30">
            <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">{card.priceLabel}</span>
            <div className="text-right">
              <span className="text-[#8A9A5B] font-bold text-2xl tabular-nums">{card.priceValue}</span>
              {card.priceUnit && <span className="text-[11px] text-[#2B2B2B]/45 ml-1">{card.priceUnit}</span>}
            </div>
          </div>

          {card.footer && (
            <p className="text-[10px] text-[#2B2B2B]/35 text-center italic mt-2">{card.footer}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="flex-1 h-11 rounded-xl bg-[#8A9A5B] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2"
          >
            <Copy size={14} /> Copy text
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-white/15 text-white text-[13.5px] font-semibold"
          >
            Close
          </button>
        </div>
        <p className="text-center text-[11px] text-white/60">Take a screenshot to share as image.</p>
      </div>
    </div>
  );
}
