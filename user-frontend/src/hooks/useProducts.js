import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetch products for a given category slug.
 * Returns { products, loading, error }
 */
export function useProducts(categorySlug) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categorySlug) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchProducts() {
      const { data, error: err } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, categories(slug)')
        .eq('available', true)
        .eq('categories.slug', categorySlug)
        .not('categories', 'is', null)
        .order('name');

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // Filter by slug (the join filter above sometimes returns all rows; this is the safe guard)
      const filtered = (data || []).filter(
        (p) => p.categories?.slug === categorySlug
      );

      // Map DB shape → component shape
      setProducts(
        filtered.map((p) => ({
          id: p.id,
          name: p.name,
          ingredients: p.description || '',
          price: `GHC${p.price}`,
          rawPrice: Number(p.price),
          image: p.image_url || '',
        }))
      );
      setLoading(false);
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [categorySlug]);

  return { products, loading, error };
}
