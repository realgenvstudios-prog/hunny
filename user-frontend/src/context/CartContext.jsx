import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'hunny_cart';

const CartContext = createContext(null);

// ── helpers ────────────────────────────────────────────────

function loadLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── provider ───────────────────────────────────────────────

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from Supabase for logged-in user
  const fetchSupabaseCart = useCallback(async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, products(id, name, description, price, image_url)')
      .eq('user_id', user.id);

    if (error) return [];

    return (data || []).map((row) => ({
      cartItemId: row.id,
      product_id: row.products.id,
      name: row.products.name,
      description: row.products.description || '',
      price: Number(row.products.price),
      image: row.products.image_url || '',
      qty: row.quantity,
    }));
  }, [user]);

  // Merge localStorage cart into Supabase on login
  const mergeLocalToSupabase = useCallback(async (localItems) => {
    for (const item of localItems) {
      await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: item.product_id, quantity: item.qty },
          { onConflict: 'user_id,product_id', ignoreDuplicates: false }
        );
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  // Load cart on mount / user change
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      if (user) {
        const localItems = loadLocalCart();
        if (localItems.length > 0) await mergeLocalToSupabase(localItems);
        const dbItems = await fetchSupabaseCart();
        if (!cancelled) setItems(dbItems);
      } else {
        if (!cancelled) setItems(loadLocalCart());
      }

      setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, [user, fetchSupabaseCart, mergeLocalToSupabase]);

  // ── cart operations ──────────────────────────────────────

  const addToCart = useCallback(async (product) => {
    // product: { id (uuid), name, description, price, image }
    if (user) {
      const existing = items.find((i) => i.product_id === product.id);
      const newQty = (existing?.qty || 0) + 1;

      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: product.id, quantity: newQty },
          { onConflict: 'user_id,product_id' }
        )
        .select('id')
        .single();

      if (error) return;

      setItems((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.product_id === product.id ? { ...i, qty: newQty } : i
          );
        }
        return [...prev, {
          cartItemId: data.id,
          product_id: product.id,
          name: product.name,
          description: product.description || '',
          price: Number(product.price),
          image: product.image || '',
          qty: 1,
        }];
      });
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        let updated;
        if (existing) {
          updated = prev.map((i) =>
            i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          updated = [...prev, {
            product_id: product.id,
            name: product.name,
            description: product.description || '',
            price: Number(product.price),
            image: product.image || '',
            qty: 1,
          }];
        }
        saveLocalCart(updated);
        return updated;
      });
    }
  }, [user, items]);

  const updateQty = useCallback(async (product_id, delta) => {
    const item = items.find((i) => i.product_id === product_id);
    if (!item) return;
    const newQty = item.qty + delta;

    if (newQty <= 0) {
      removeFromCart(product_id);
      return;
    }

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('user_id', user.id)
        .eq('product_id', product_id);
    }

    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product_id === product_id ? { ...i, qty: newQty } : i
      );
      if (!user) saveLocalCart(updated);
      return updated;
    });
  }, [user, items]);

  const removeFromCart = useCallback(async (product_id) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);
    }

    setItems((prev) => {
      const updated = prev.filter((i) => i.product_id !== product_id);
      if (!user) saveLocalCart(updated);
      return updated;
    });
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setItems([]);
  }, [user]);

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      cartCount,
      subtotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
