import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYOUT_FEE_PERCENTAGE = 0.20; // 20% service fee

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Check wallet balance
    const { data: wallet } = await supabaseClient
      .from("wallet_balances")
      .select("*")
      .eq("user_id", user.id)
      .eq("currency", "USD")
      .single();

    if (!wallet || wallet.available_balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Check for connected Stripe account
    const { data: connectedAccount } = await supabaseClient
      .from("stripe_connected_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!connectedAccount) {
      throw new Error("Please connect your bank account first");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify account is ready for payouts
    const account = await stripe.accounts.retrieve(connectedAccount.stripe_account_id);
    if (!account.payouts_enabled) {
      throw new Error("Your payout account is not fully set up yet");
    }

    // Calculate fees
    const feeAmount = Math.round(amount * PAYOUT_FEE_PERCENTAGE * 100) / 100;
    const netAmount = amount - feeAmount;

    // Create payout request
    const { data: payoutRequest } = await supabaseClient
      .from("payout_requests")
      .insert({
        user_id: user.id,
        amount: amount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        status: "processing",
        payment_method: "stripe",
        stripe_account_id: connectedAccount.stripe_account_id,
      })
      .select()
      .single();

    // Update wallet (move to pending)
    await supabaseClient
      .from("wallet_balances")
      .update({
        available_balance: wallet.available_balance - amount,
        pending_balance: wallet.pending_balance + amount,
      })
      .eq("id", wallet.id);

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(netAmount * 100), // Convert to cents
      currency: "usd",
      destination: connectedAccount.stripe_account_id,
      description: `Payout request ${payoutRequest.id}`,
    });

    // Update payout request with transfer info
    await supabaseClient
      .from("payout_requests")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutRequest.id);

    // Record transaction
    await supabaseClient.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      status: "completed",
      amount: amount,
      fee_amount: feeAmount,
      net_amount: netAmount,
      payment_method: "stripe",
      stripe_payout_id: transfer.id,
      description: `Withdrawal of $${netAmount} (after 20% fee)`,
    });

    // Update wallet (remove from pending, update total withdrawn)
    await supabaseClient
      .from("wallet_balances")
      .update({
        pending_balance: wallet.pending_balance,
        total_withdrawn: wallet.total_withdrawn + amount,
      })
      .eq("id", wallet.id);

    console.log("Payout completed for user:", user.id, "Net amount:", netAmount);

    return new Response(
      JSON.stringify({
        success: true,
        netAmount: netAmount,
        feeAmount: feeAmount,
        payoutId: payoutRequest.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
