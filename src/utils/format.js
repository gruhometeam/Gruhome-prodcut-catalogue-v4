export const formatINR = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const inferCategory = (product) => {
  const d = (product['DESIGN NAME'] || '').toString().toUpperCase();
  const b = (product['BOOK NAME'] || '').toString().toUpperCase();
  const brand = (product['BRAND NAME'] || '').toString().toUpperCase();
  if (brand.includes('WALLPAPER') || d.includes('WALLPAPER') || b.includes('WALLPAPER')) return 'Wallpaper';
  if (d === 'UPHL' || d.includes('UPHL') || d.includes('UPHOLSTERY') || b.includes('TEDDY') || b.includes('VELVET')) return 'Upholstery';
  if (d.includes('BLIND') || d.includes('ROLLER') || b.includes('BLIND') || b.includes('ROLLER')) return 'Blinds';
  return 'Curtain Fabric';
};

export const UNIT_BY_CATEGORY = {
  'Curtain Fabric': 'per metre',
  'Upholstery': 'per metre',
  'Wallpaper': 'per roll',
  'Blinds': 'per sq.ft',
};
