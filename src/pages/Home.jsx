import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import MultiFilterBar from '../components/MultiFilterBar';
import { X } from 'lucide-react';

export default function Home() {
  const { products, headers, loading, error, retry } = useProducts();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter specs for the dropdowns
  const filterSpecs = useMemo(() => {
    if (!headers || !headers.length || !products || !products.length) return [];
    
    return headers.map(key => {
      const allValues = products
        .map(p => {
          const val = p[key];
          if (val === undefined || val === null) return '';
          return val.toString().trim();
        })
        .filter(v => v !== '' && v !== '0' && v !== 'N/A' && v !== 'undefined');
      
      const uniqueValues = Array.from(new Set(allValues)).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
      
      if (uniqueValues.length > 0) {
        return { key, label: key, options: uniqueValues };
      }
      return null;
    }).filter(Boolean);
  }, [products, headers]);

  const filteredProducts = useMemo(() => {
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const matchesSearch = searchTerms.every(term => {
        return Object.values(p).some(val => 
          val?.toString().toLowerCase().includes(term)
        );
      });

      const matchesFilters = Object.entries(filters).every(([key, values]) => {
        if (!values || (Array.isArray(values) && values.length === 0)) return true;
        const productVal = p[key]?.toString().trim();
        if (productVal === undefined || productVal === null) return false;
        const selectedValues = Array.isArray(values) ? values : [values];
        return selectedValues.includes(productVal);
      });

      return matchesSearch && matchesFilters;
    });
  }, [products, search, filters]);

  const activeHeaders = useMemo(() => headers, [headers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const currentValues = Array.isArray(prev[key]) ? prev[key] : (prev[key] ? [prev[key]] : []);
      if (value === null) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      if (newValues.length === 0) {
        const nextFilters = { ...prev };
        delete nextFilters[key];
        return nextFilters;
      }
      return { ...prev, [key]: newValues };
    });
  };

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#F4ECD8]">
        <h2 className="font-serif text-[32px] mb-4 text-[#2B2B2B]">Catalog Unavailable</h2>
        <button onClick={retry} className="bg-[#8A9A5B] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#8A9A5B]/20 active:scale-95 transition-transform">
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4ECD8] pb-20 selection:bg-[#8A9A5B]/20 overflow-x-hidden">
      <div className="w-[96%] mx-auto py-8">
        <header className="mb-8 w-full flex flex-col items-stretch">
          <h1 className="font-serif text-[48px] text-[#2B2B2B] leading-none mb-6">Catalog</h1>
          
          <div className="flex flex-col gap-6 w-full items-stretch">
            <div className="w-full bg-[#F4ECD8] rounded-[12px] border border-[#C8C2B8] shadow-sm overflow-hidden h-[64px] flex items-center">
              <SearchBar 
                value={search} 
                onChange={setSearch} 
                placeholder="Search by name, design, or price code..."
              />
            </div>

            <div className="w-full overflow-hidden flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <MultiFilterBar 
                  filterSpecs={filterSpecs}
                  selectedFilters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              {Object.keys(filters).length > 0 && (
                <button 
                  onClick={() => setFilters({})}
                  className="flex-shrink-0 text-[11px] uppercase tracking-[1px] text-[#8A9A5B] font-bold hover:text-[#8A9A5B]/70 px-2 h-[36px]"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </header>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-[12px] h-[240px] animate-pulse border border-[#C8C2B8]" />
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '32px',
            width: '100%'
          }}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                headers={activeHeaders}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-32 w-full">
            <p className="font-serif text-[24px] text-[#2B2B2B]/30 italic">No matches in our collection</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm flex items-center justify-center z-[10000] transition-all duration-300 px-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-[12px] p-[24px] w-full max-w-[90%] md:max-w-[60%] max-h-[85vh] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-[#C8C2B8]/20 flex justify-between items-start sticky top-[-24px] bg-white z-10 mb-6 pb-4 pt-1">
              <h2 className="font-serif text-[32px] text-[#2B2B2B] leading-tight pr-8">
                {selectedProduct[activeHeaders[0]]}
              </h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-[#F4ECD8] rounded-full transition-colors text-[#2B2B2B]/30 hover:text-[#2B2B2B]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              {activeHeaders.map(header => {
                const value = selectedProduct[header];
                if (!value || value === '0' || value === 'N/A') return null;
                
                const isNumeric = !isNaN(parseFloat(value.toString().replace(/[^0-9.]/g, ''))) && 
                                 (header.toLowerCase().includes('price') || header.toLowerCase().includes('rrp') || header.toLowerCase().includes('rate') || header.toLowerCase().includes('roll') || header.toLowerCase().includes('cut'));

                return (
                  <div key={header} className="flex flex-col gap-1 border-b border-[#C8C2B8]/10 pb-4 last:border-0">
                    <span className="text-[11px] uppercase tracking-[2px] text-[#2B2B2B]/40 font-bold font-sans">
                      {header}
                    </span>
                    <span className="text-[18px] text-[#2B2B2B] font-medium font-sans">
                      {isNumeric ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(value.toString().replace(/[^0-9.]/g, ''))) : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
