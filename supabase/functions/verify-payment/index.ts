import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, order, items } = await req.json();

    if (!reference || !order || !items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify payment with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', detail: paystackData.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Save the verified order using the service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: savedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: order.user_id,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        total: order.total,
        delivery_address: order.delivery_address,
        notes: order.notes || null,
        payment_reference: reference,
        payment_status: 'paid',
        status: 'confirmed',
      })
      .select()
      .single();

    if (orderErr) {
      console.error('Order insert error:', orderErr.message);
      return new Response(
        JSON.stringify({ error: 'Failed to save order', detail: orderErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: itemsErr } = await supabase.from('order_items').insert(
      items.map((item: { product_id: string; name: string; price: number; qty: number; image?: string }) => ({
        order_id: savedOrder.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        image_url: item.image || null,
      }))
    );

    if (itemsErr) {
      console.error('Order items insert error:', itemsErr.message);
      return new Response(
        JSON.stringify({ error: 'Failed to save order items', detail: itemsErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, orderId: savedOrder.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
