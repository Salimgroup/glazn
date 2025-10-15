import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { request_id, amount, message } = await req.json();

    if (!request_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request_id or amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing contribution: User ${user.id} contributing $${amount} to bounty ${request_id}`);

    // Check if bounty exists and get minimum contribution
    const { data: bounty, error: bountyError } = await supabase
      .from('requests')
      .select('id, title, bounty, minimum_contribution, allow_contributions, status')
      .eq('id', request_id)
      .single();

    if (bountyError || !bounty) {
      console.error('Bounty not found:', bountyError);
      return new Response(
        JSON.stringify({ error: 'Bounty not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (bounty.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'This bounty is no longer accepting contributions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!bounty.allow_contributions) {
      return new Response(
        JSON.stringify({ error: 'This bounty does not accept contributions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const minContribution = bounty.minimum_contribution || 0;
    if (amount < minContribution) {
      return new Response(
        JSON.stringify({ error: `Minimum contribution is $${minContribution}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet_balances')
      .select('available_balance')
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .single();

    if (walletError || !wallet) {
      console.error('Wallet not found:', walletError);
      return new Response(
        JSON.stringify({ error: 'Wallet not found. Please deposit funds first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (wallet.available_balance < amount) {
      return new Response(
        JSON.stringify({ error: `Insufficient balance. Available: $${wallet.available_balance}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from wallet
    const { error: deductError } = await supabase
      .from('wallet_balances')
      .update({
        available_balance: wallet.available_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('currency', 'USD');

    if (deductError) {
      console.error('Failed to deduct from wallet:', deductError);
      return new Response(
        JSON.stringify({ error: 'Failed to process payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create contribution record
    const { data: contribution, error: contributionError } = await supabase
      .from('bounty_contributions')
      .insert({
        request_id,
        contributor_id: user.id,
        amount,
        message: message || null,
        status: 'accepted'
      })
      .select()
      .single();

    if (contributionError) {
      console.error('Failed to create contribution:', contributionError);
      // Rollback wallet deduction
      await supabase
        .from('wallet_balances')
        .update({
          available_balance: wallet.available_balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('currency', 'USD');

      return new Response(
        JSON.stringify({ error: 'Failed to create contribution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'bounty_contribution',
      amount: amount,
      net_amount: amount,
      fee_amount: 0,
      payment_method: 'wallet',
      status: 'completed',
      currency: 'USD',
      description: `Contributed $${amount} to bounty: ${bounty.title}`,
      metadata: {
        request_id,
        contribution_id: contribution.id
      }
    });

    console.log(`Contribution successful: $${amount} added to bounty ${request_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        contribution,
        new_total: bounty.bounty + amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
