import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const planId = (location.state?.planId as string) || "pro";

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const planDetails = {
    pro: { name: "Pro", price: 49 },
    enterprise: { name: "Enterprise", price: 199 },
  };

  const plan = planDetails[planId as keyof typeof planDetails] || planDetails.pro;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiry || !cvv) {
      toast.error("Please fill in all payment details");
      return;
    }

    // Mock payment processing
    toast.success("Payment processed successfully! Your plan has been upgraded.");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/subscription">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Complete your purchase securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "");
                        if (value.length <= 16 && /^\d*$/.test(value)) {
                          const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                          setCardNumber(formatted);
                        }
                      }}
                      className="bg-input-background pl-10"
                      maxLength={19}
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4) {
                          const formatted =
                            value.length >= 2
                              ? `${value.slice(0, 2)}/${value.slice(2)}`
                              : value;
                          setExpiry(formatted);
                        }
                      }}
                      className="bg-input-background"
                      maxLength={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 3) {
                          setCvv(value);
                        }
                      }}
                      className="bg-input-background"
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <Separator />

                <Button type="submit" className="w-full">
                  Complete Purchase
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Demo: Use any card details to simulate payment
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground font-medium">{plan.name} Plan</span>
                  <span className="text-foreground font-semibold">${plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Billed monthly, cancel anytime
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${plan.price}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">$0.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${plan.price}.00</span>
              </div>

              <div className="bg-secondary p-4 rounded-lg mt-6">
                <h4 className="font-medium text-foreground mb-2">What's included:</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  {plan.name === "Pro" ? (
                    <>
                      <li>• Unlimited lead requests</li>
                      <li>• 48-hour search duration</li>
                      <li>• Up to 500 leads per request</li>
                      <li>• Priority support</li>
                    </>
                  ) : (
                    <>
                      <li>• Unlimited lead requests</li>
                      <li>• 72-hour search duration</li>
                      <li>• Unlimited leads per request</li>
                      <li>• Dedicated account manager</li>
                      <li>• API access</li>
                    </>
                  )}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4">
                14-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}