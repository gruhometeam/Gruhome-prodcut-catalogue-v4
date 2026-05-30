import { useState, useEffect } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbzFR24yya4LU-HB3JyLe13PCEk95Kbz9CF5jKeNU4Evh3DPauRk8ybWC3GZ1bkLoVuP/exec';

// ── IndexedDB key-value cache ──────────────────────────────────
// localStorage tops out at ~5MB and stores stringified JSON, which the
// catalog now exceeds. IndexedDB holds hundreds of MB and stores the parsed
// object directly (structured clone) — so there's no JSON.parse cost either.
const DB_NAME = 'gruhome';
const STORE = 'kv';
const CACHE_KEY = 'product_catalog_cache';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const useProducts = () => {
  const [data, setData] = useState({ products: [], headers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Cache-first: render the stored snapshot immediately, then refresh from
    // the network. Read failures are non-fatal — we just fall through to fetch.
    let hadCache = false;
    try {
      const cached = await idbGet(CACHE_KEY);
      if (cached && cached.products?.length) {
        hadCache = true;
        setData(cached);
      }
    } catch (_) {}

    try {
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
        idbSet(CACHE_KEY, result).catch(() => {}); // best-effort cache write
        // Drop the legacy localStorage cache so it doesn't sit stale at ~5MB.
        try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
      }
    } catch (err) {
      // Only surface an error if there's nothing cached to show.
      if (!hadCache) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, error, retry: fetchData };
};
