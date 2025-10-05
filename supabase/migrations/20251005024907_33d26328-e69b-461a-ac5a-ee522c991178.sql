-- Fix payout_requests RLS policies to properly protect sensitive data like crypto wallet addresses

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Deny all anonymous access to payout_requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can view own payouts" ON payout_requests;
DROP POLICY IF EXISTS "Users can create payout requests" ON payout_requests;

-- Create secure policies that properly restrict access

-- 1. Users can only view their own payout requests (protects crypto_wallet_address)
CREATE POLICY "Users can view own payout requests"
ON payout_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Admins can view all payout requests (for support purposes)
CREATE POLICY "Admins can view all payout requests"
ON payout_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3. Users can create their own payout requests
CREATE POLICY "Users can create own payout requests"
ON payout_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Prevent all UPDATE operations from clients (only edge functions with service role should update)
CREATE POLICY "Prevent direct payout request updates"
ON payout_requests
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- 5. Prevent all DELETE operations
CREATE POLICY "Prevent payout request deletion"
ON payout_requests
FOR DELETE
TO authenticated
USING (false);

-- 6. Explicitly deny all anonymous (unauthenticated) access
CREATE POLICY "Block all anonymous access to payouts"
ON payout_requests
FOR ALL
TO anon
USING (false)
WITH CHECK (false);