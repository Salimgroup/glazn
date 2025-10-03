-- Add UPDATE policy to wallet_balances to prevent direct user manipulation
-- Only backend functions (using service role) can update wallet balances
CREATE POLICY "Prevent direct user updates to wallet balances"
ON public.wallet_balances
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Add DELETE policy to prevent users from deleting wallet records
CREATE POLICY "Prevent wallet deletion"
ON public.wallet_balances
FOR DELETE
TO authenticated
USING (false);

-- Add comment explaining that wallet updates must go through backend functions
COMMENT ON TABLE public.wallet_balances IS 'Wallet balance updates must be performed through backend functions (verify-deposit, request-payout) using service role key. Direct user updates are blocked for security.';