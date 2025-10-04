-- Add explicit policy to deny all anonymous access to wallet_balances
CREATE POLICY "Deny all anonymous access to wallet_balances"
ON wallet_balances
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add policy to deny anonymous access to transactions table
CREATE POLICY "Deny all anonymous access to transactions"
ON transactions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add policy to deny anonymous access to payout_requests table
CREATE POLICY "Deny all anonymous access to payout_requests"
ON payout_requests
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add policy to deny anonymous access to stripe_connected_accounts table
CREATE POLICY "Deny all anonymous access to stripe_connected_accounts"
ON stripe_connected_accounts
FOR ALL
TO anon
USING (false)
WITH CHECK (false);