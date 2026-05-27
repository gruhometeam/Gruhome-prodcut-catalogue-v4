import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Home from './pages/Home';
import Details from './pages/Details';
import Quote from './pages/Quote';
import Cart from './pages/Cart';
import TabBar from './components/TabBar';
import Toast from './components/Toast';

export const CartContext = createContext(null);

function AppInner() {
  const { pathname } = useLocation();
  const { cart } = useContext(CartContext);
  const showTabBar = pathname === '/' || pathname === '/cart';

  return (
    <div className="min-h-screen bg-[#111111]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      {showTabBar && <TabBar cartCount={cart.length} />}
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [hindiOn, setHindiOn] = useState(false);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3200);
  };

  const addToCart = (item) => {
    setCart(prev => [
      ...prev,
      { ...item, id: Date.now() + '-' + Math.random().toString(36).slice(2, 6) },
    ]);
    showToast('Added to cart · ' + (item.product['DESIGN NAME'] || ''));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const toggleHindi = () => setHindiOn(v => !v);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, showToast, hindiOn, toggleHindi }}>
      <BrowserRouter>
        <AppInner />
        {toast && <Toast text={toast} />}
      </BrowserRouter>
    </CartContext.Provider>
  );
}
