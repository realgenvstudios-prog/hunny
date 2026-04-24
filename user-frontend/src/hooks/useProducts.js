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
      // Step 1: resolve category slug → id
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (cancelled) return;

      if (catErr || !catData) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      // Step 2: fetch products for that category
      const { data, error: err } = await supabase
        .from('products')
        .select('id, name, description, price, image_url')
        .eq('available', true)
        .eq('category_id', catData.id)
        .order('name');

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setProducts(
        (data || []).map((p) => ({
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
