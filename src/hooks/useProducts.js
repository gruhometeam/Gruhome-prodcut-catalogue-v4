import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbzFR24yya4LU-HB3JyLe13PCEk95Kbz9CF5jKeNU4Evh3DPauRk8ybWC3GZ1bkLoVuP/exec';

export const useProducts = () => {
  const [data, setData] = useState({ products: [], headers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try loading from local storage first for offline support
      const cached = localStorage.getItem('product_catalog_cache');
      if (cached) {
        setData(JSON.parse(cached));
      }

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const products = await response.json();

      if (products.length > 0) {
        // Sort by the first column (likely BOOK NAME)
        const firstCol = Object.keys(products[0])[0];
        const sortedProducts = [...products].sort((a, b) =>
          (a[firstCol] || '').toString().localeCompare((b[firstCol] || '').toString())
        );

        const result = {
          products: sortedProducts,
          headers: Object.keys(products[0])
        };

        setData(result);
        localStorage.setItem('product_catalog_cache', JSON.stringify(result));
      }
    } catch (err) {
      setError(err.message);
      // If we have cached data, we can ignore the error for now
      if (!localStorage.getItem('product_catalog_cache')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, error, retry: fetchData };
};
