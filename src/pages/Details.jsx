import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Details() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;

  if (!product) {
    return (
      <div className="p-4">
        <button onClick={() => navigate('/')} className="flex items-center text-primary mb-4">
          <ChevronLeft /> Back Home
        </button>
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="ml-2 text-xl font-bold text-primary truncate">
          {product['DESIGN NAME']}
        </h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(product).map(([key, value]) => (
            <div key={key} className="border-b border-gray-100 pb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {key}
              </span>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {value || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
