export default function ProductCard({ product, headers, onClick }) {
  const formatValue = (header, val) => {
    if (val === undefined || val === null || val === '') return '';
    
    const h = header.toLowerCase();
    const isNumeric = !isNaN(parseFloat(val.toString().replace(/[^0-9.]/g, ''))) && 
                     (h.includes('price') || h.includes('rrp') || h.includes('rate') || h.includes('roll') || h.includes('cut'));

    if (isNumeric) {
      const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(num);
    }
    return val;
  };

  // We prioritize using the passed headers, but we also ensure we don't miss any keys 
  // that might be in the product object itself.
  const displayKeys = headers && headers.length > 0 ? headers : Object.keys(product);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(200, 194, 184, 0.4)',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      className="hover:shadow-lg hover:-translate-y-1"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayKeys.map((header, index) => {
          const value = product[header];
          
          // Show the field if it has a non-empty value.
          // This applies to ALL columns (A-J and beyond) regardless of filter state.
          if (value === undefined || value === null || value === '' || value === '0' || value === 'N/A') return null;

          const formattedValue = formatValue(header, value);
          
          if (index === 0) {
            return (
              <h3 key={header} style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: '26px', 
                color: '#2B2B2B', 
                lineHeight: '1.2', 
                margin: '0 0 4px 0',
                fontWeight: '600'
              }}>
                {formattedValue}
              </h3>
            );
          }

          return (
            <div key={header} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ 
                fontSize: '10px', 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px', 
                color: 'rgba(43, 43, 43, 0.4)', 
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
              }}>
                {header}
              </span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#2B2B2B',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.4'
              }}>
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
