import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History } from "lucide-react";

interface WalletBalance {
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  payment_method: string;
  description: string;
  created_at: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadWalletData();
    checkStripeAccount();
  }, [user, navigate]);

  const loadWalletData = async () => {
    const { data: walletData } = await supabase
      .from("wallet_balances")
      .select("*")
      .eq("user_id", user?.id)
      .eq("currency", "USD")
      .single();

    if (walletData) {
      setBalance(walletData);
    }

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txData) {
      setTransactions(txData);
    }
  };

  const checkStripeAccount = async () => {
    const { data } = await supabase
      .from("stripe_connected_accounts")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    setHasStripeAccount(!!data);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("deposit-funds", {
        body: { amount: parseFloat(depositAmount) },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
        toast({ title: "Redirecting to payment..." });
      }
    } catch (error: any) {
      toast({ title: "Deposit failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account");

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Failed to connect account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (!hasStripeAccount) {
      toast({
        title: "Bank account required",
        description: "Please connect your bank account first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-payout", {
        body: { amount: parseFloat(withdrawAmount) },
      });

      if (error) throw error;

      toast({
        title: "Withdrawal successful!",
        description: `$${data.netAmount} will be sent to your bank (after 20% fee)`,
      });
      setWithdrawAmount("");
      loadWalletData();
    } catch (error: any) {
      toast({ title: "Withdrawal failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <WalletIcon className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Wallet</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              ${balance?.available_balance.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Processing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">
              ${balance?.pending_balance.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Earned</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              ${balance?.total_deposited.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposit" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit">
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle>Add Funds</CardTitle>
              <CardDescription>
                Deposit funds to your wallet via Stripe (6% service fee applies)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (USD)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="100.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                {depositAmount && (
                  <p className="text-sm text-muted-foreground">
                    Total with 6% fee: $
                    {(parseFloat(depositAmount) * 1.06).toFixed(2)}
                  </p>
                )}
              </div>
              <Button onClick={handleDeposit} disabled={isLoading} className="w-full">
                {isLoading ? "Processing..." : "Deposit via Stripe"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>
                Transfer funds to your bank account (20% service fee applies)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasStripeAccount ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Connect your bank account to receive payouts
                  </p>
                  <Button onClick={handleConnectStripe} disabled={isLoading}>
                    {isLoading ? "Connecting..." : "Connect Bank Account"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="100.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      max={balance?.available_balance || 0}
                    />
                    {withdrawAmount && (
                      <p className="text-sm text-muted-foreground">
                        You'll receive: $
                        {(parseFloat(withdrawAmount) * 0.8).toFixed(2)} (after 20% fee)
                      </p>
                    )}
                  </div>
                  <Button onClick={handleWithdraw} disabled={isLoading} className="w-full">
                    {isLoading ? "Processing..." : "Withdraw"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()} •{" "}
                          {tx.payment_method.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            tx.type === "deposit" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}${tx.net_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fee: ${tx.fee_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Integration (Coming Soon)</CardTitle>
          <CardDescription>
            XRP and Solana deposits/withdrawals will be available in supported states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on adding cryptocurrency support via XRP and Solana networks. This
            feature will be available based on your location's regulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
