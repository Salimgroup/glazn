import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || !user) {
      navigate("/wallet");
      return;
    }

    verifyDeposit(sessionId);
  }, [searchParams, user, navigate]);

  const verifyDeposit = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-deposit", {
        body: { sessionId },
      });

      if (error) throw error;

      if (data.success) {
        setAmount(data.amount);
      } else {
        setError("Payment verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="container mx-auto p-6 max-w-md flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Payment...
            </CardTitle>
            <CardDescription>Please wait while we confirm your deposit</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-md flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/wallet")} className="w-full">
              Return to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful!
          </CardTitle>
          <CardDescription>Your deposit has been added to your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Amount Deposited</p>
            <p className="text-4xl font-bold text-primary">${amount.toFixed(2)}</p>
          </div>
          <Button onClick={() => navigate("/wallet")} className="w-full">
            View Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
