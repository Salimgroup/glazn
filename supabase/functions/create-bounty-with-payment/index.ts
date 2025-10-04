import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOUNTY-WITH-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    const { 
      title, 
      description, 
      bounty, 
      category, 
      deadline, 
      allow_contributions = true,
      minimum_contribution = 0,
      content_creator_id = null,
      is_anonymous = false
    } = body;

    if (!title || !description || !bounty || !category || !deadline) {
      throw new Error("Missing required fields");
    }

    const bountyAmount = Number(bounty);
    if (isNaN(bountyAmount) || bountyAmount <= 0) {
      throw new Error("Invalid bounty amount");
    }

    logStep("Checking wallet balance", { bountyAmount });

    // Get user's wallet balance
    const { data: walletData, error: walletError } = await supabaseClient
      .from('wallet_balances')
      .select('available_balance')
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .single();

    if (walletError) {
      logStep("Wallet query error", { error: walletError });
      throw new Error("Failed to check wallet balance");
    }

    if (!walletData) {
      throw new Error("Wallet not found. Please deposit funds first.");
    }

    if (walletData.available_balance < bountyAmount) {
      throw new Error(
        `Insufficient balance. Available: $${walletData.available_balance}, Required: $${bountyAmount}`
      );
    }

    logStep("Sufficient balance confirmed", { 
      available: walletData.available_balance,
      required: bountyAmount 
    });

    // Atomically deduct from wallet and create bounty
    // First, deduct from wallet
    const { error: deductError } = await supabaseClient
      .from('wallet_balances')
      .update({ 
        available_balance: walletData.available_balance - bountyAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .eq('available_balance', walletData.available_balance); // Optimistic locking

    if (deductError) {
      logStep("Wallet deduction error", { error: deductError });
      throw new Error("Failed to process payment. Please try again.");
    }

    logStep("Wallet debited successfully", { amount: bountyAmount });

    // Create the bounty
    const { data: bountyData, error: bountyError } = await supabaseClient
      .from('requests')
      .insert({
        user_id: user.id,
        title,
        description,
        bounty: bountyAmount,
        category,
        deadline,
        status: 'open',
        allow_contributions,
        minimum_contribution,
        content_creator_id,
        is_anonymous
      })
      .select()
      .single();

    if (bountyError) {
      logStep("Bounty creation error - rolling back wallet", { error: bountyError });
      
      // Rollback: Add the money back
      await supabaseClient
        .from('wallet_balances')
        .update({ 
          available_balance: walletData.available_balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('currency', 'USD');

      throw new Error("Failed to create bounty. Payment refunded.");
    }

    logStep("Bounty created successfully", { bountyId: bountyData.id });

    // Record transaction
    await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'bounty_payment',
        amount: bountyAmount,
        net_amount: bountyAmount,
        fee_amount: 0,
        payment_method: 'wallet',
        status: 'completed',
        currency: 'USD',
        description: `Payment for bounty: ${title}`,
        metadata: { bounty_id: bountyData.id }
      });

    logStep("Transaction recorded");

    return new Response(
      JSON.stringify({ 
        success: true, 
        bounty: bountyData,
        message: 'Bounty created successfully. Payment processed.'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
