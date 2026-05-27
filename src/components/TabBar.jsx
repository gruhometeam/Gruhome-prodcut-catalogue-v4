import { Search, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../App';
import { H } from '../utils/hindi';

export default function TabBar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hindiOn } = useContext(CartContext);

  const tab = (path, label, hindiKey, Icon) => {
    const active = pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
      >
        <span className="relative flex">
          <Icon size={22} className={active ? 'text-white' : 'text-white/35'} />
          {label === 'Cart' && cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#8A9A5B] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              {cartCount}
            </span>
          )}
        </span>
        <span className={`text-[10.5px] ${active ? 'font-semibold text-white' : 'font-medium text-white/35'}`}>
          {label}
        </span>
        {hindiOn && (
          <span className="text-[9px] text-white/30 leading-none">{H[hindiKey]}</span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1C1C1E] border-t border-white/10 flex pb-6 pt-1.5">
      {tab('/', 'Catalog', 'catalog', Search)}
      {tab('/cart', 'Cart', 'cart', ShoppingCart)}
    </div>
  );
}
