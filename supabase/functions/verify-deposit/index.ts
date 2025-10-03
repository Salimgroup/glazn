import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" && session.metadata?.type === "deposit") {
      const amount = parseFloat(session.metadata.amount);
      const feeAmount = parseFloat(session.metadata.fee_amount);
      const netAmount = parseFloat(session.metadata.net_amount);

      // Create or update wallet balance
      const { data: wallet } = await supabaseClient
        .from("wallet_balances")
        .select("*")
        .eq("user_id", user.id)
        .eq("currency", "USD")
        .single();

      if (wallet) {
        await supabaseClient
          .from("wallet_balances")
          .update({
            available_balance: wallet.available_balance + netAmount,
            total_deposited: wallet.total_deposited + netAmount,
          })
          .eq("id", wallet.id);
      } else {
        await supabaseClient.from("wallet_balances").insert({
          user_id: user.id,
          available_balance: netAmount,
          total_deposited: netAmount,
          currency: "USD",
        });
      }

      // Record transaction
      await supabaseClient.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        status: "completed",
        amount: amount + feeAmount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        payment_method: "stripe",
        stripe_payment_id: session.payment_intent as string,
        description: `Wallet deposit of $${netAmount}`,
      });

      console.log("Deposit verified for user:", user.id, "Amount:", netAmount);

      return new Response(JSON.stringify({ success: true, amount: netAmount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Payment not completed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Verify deposit error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
