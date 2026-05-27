import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Share2, Search } from 'lucide-react';
import { CartContext } from '../App';
import { formatINR } from '../utils/format';
import ShareModal from '../components/ShareModal';

function CartItem({ item, onRemove }) {
  return (
    <div className="bg-white border border-[#C8C2B8]/50 rounded-xl p-3.5 flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#FBF5E5] border border-[#C8C2B8]/40 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-[16px] font-semibold text-[#2B2B2B] truncate leading-tight">
              {item.product['DESIGN NAME'] || 'Unknown'}
            </span>
            <button onClick={onRemove} className="text-[#2B2B2B]/35 flex-shrink-0 p-1 -mr-1">
              <X size={16} />
            </button>
          </div>
          <div className="text-[11.5px] text-[#2B2B2B]/55 mt-0.5 truncate">
            {item.product['BRAND NAME']}{item.product['BOOK NAME'] ? `  ·  ${item.product['BOOK NAME']}` : ''}
          </div>
          {item.qqn && (
            <div className="text-[10px] font-mono text-[#2B2B2B]/35 tracking-wide mt-0.5">{item.qqn}</div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#FBF5E5] rounded-lg px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">{item.mode}</div>
          <div className="text-[11.5px] text-[#2B2B2B] mt-0.5 truncate">{item.summary}</div>
          {item.discount > 0 && (
            <div className="text-[10px] text-[#8A9A5B] font-semibold mt-0.5">{item.discount}% off materials</div>
          )}
        </div>
        <span className="text-[#8A9A5B] font-bold text-[16px] tabular-nums flex-shrink-0 ml-2">{formatINR(item.total)}</span>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, showToast } = useContext(CartContext);
  const [clientName, setClientName] = useState('');
  const [shareCard, setShareCard] = useState(null);

  const grandTotal = cart.reduce((s, i) => s + i.total, 0);

  const buildShareCard = () => {
    const headerLines = [`*Gruhome — Multi-item Quote*`, clientName ? `Client: ${clientName}` : null, ``].filter(Boolean);
    const blocks = cart.map((item, i) => {
      const discount = Math.round(item.computed.materials * (item.discount / 100));
      const lines = [
        `${i + 1}. ${item.product['DESIGN NAME']} · ${item.product['BRAND NAME']}`,
        item.qqn ? `   Ref: ${item.qqn}` : null,
        `   ${item.mode} · ${item.summary}`,
        `   Materials ${formatINR(item.computed.materials)}${item.computed.labor ? ` · Labour ${formatINR(item.computed.labor)}` : ''}`,
        item.discount > 0 ? `   Discount ${item.discount}%: − ${formatINR(discount)}` : null,
        `   ${formatINR(item.total)}`,
      ].filter(Boolean);
      return lines.join('\n');
    });
    const footerLines = [``, `*Grand total: ${formatINR(grandTotal)}*`, ``, `_All prices inclusive of GST · Indicative, subject to final measurement._`];
    const text = [...headerLines, blocks.join('\n\n'), ...footerLines].join('\n');

    const visualLines = [];
    cart.forEach((item, idx) => {
      const discount = Math.round(item.computed.materials * (item.discount / 100));
      visualLines.push({ label: `${idx + 1}. ${item.product['DESIGN NAME']}`, value: formatINR(item.total), bold: true });
      visualLines.push({ label: `${item.mode} · ${item.summary}`, value: '', sub: true });
      if (item.discount > 0) visualLines.push({ label: `Discount ${item.discount}%`, value: `− ${formatINR(discount)}`, sub: true, discount: true });
      if (idx < cart.length - 1) visualLines.push({ divider: true });
    });

    return {
      title: clientName || 'Multi-item Quote',
      subtitle: `${cart.length} item${cart.length > 1 ? 's' : ''}  ·  Gruhome`,
      lines: visualLines,
      priceLabel: 'Grand total',
      priceValue: formatINR(grandTotal),
      priceUnit: '',
      footer: 'All prices inclusive of GST · Indicative, subject to final measurement.',
      text,
    };
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); }
    catch { try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (_) {} }
    showToast('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#F4ECD8] pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-serif text-[42px] text-[#2B2B2B] leading-none">Cart</h1>
          <span className="text-[11.5px] text-[#2B2B2B]/55">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>
        {cart.length > 0 && (
          <input
            type="text"
            placeholder="Client name (optional)"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C8C2B8] text-[#2B2B2B] text-[14px] placeholder-[#2B2B2B]/30 outline-none"
          />
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#C8C2B8] flex items-center justify-center text-[#2B2B2B]/35">
            <Search size={24} />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#2B2B2B] mb-1">Cart is empty</h2>
            <p className="text-[13px] text-[#2B2B2B]/55 leading-relaxed max-w-xs">
              Add quotes from the catalog — multiple items land here with a single grand total.
            </p>
          </div>
          <button onClick={() => navigate('/')}
            className="mt-2 px-6 py-3 rounded-xl bg-[#8A9A5B] text-white font-semibold text-[13.5px]">
            Browse catalog →
          </button>
        </div>
      ) : (
        <>
          <div className="px-4 flex flex-col gap-3 mb-4">
            {cart.map(item => (
              <CartItem key={item.id} item={item} onRemove={() => removeFromCart(item.id)} />
            ))}
          </div>

          {/* Sticky total bar */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-[#C8C2B8] px-4 py-3 flex flex-col gap-2.5 z-20">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Grand total</span>
              <div className="text-right">
                <span className="text-[#8A9A5B] font-bold text-2xl tabular-nums">{formatINR(grandTotal)}</span>
                <div className="text-[9.5px] text-[#2B2B2B]/35 mt-0.5">incl. GST</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { clearCart(); showToast('Cart cleared'); }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#C8C2B8] text-[#2B2B2B]/55 text-[13px] font-semibold">
                <Trash2 size={14} /> Clear
              </button>
              <button onClick={() => setShareCard(buildShareCard())}
                className="flex-1 py-2.5 rounded-xl bg-[#8A9A5B] text-white font-semibold text-[14px] flex items-center justify-center gap-2">
                <Share2 size={16} /> Share quote
              </button>
            </div>
          </div>
        </>
      )}

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
