import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check } from "lucide-react";
import { getCurrentUser } from "../lib/auth";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out helpyoufindthat",
    features: [
      "Up to 3 lead requests per month",
      "24-hour search duration",
      "Basic email notifications",
      "Up to 50 leads per request",
      "CSV export",
    ],
    limitations: [
      "No priority support",
      "Standard matching algorithm",
    ],
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited lead requests",
      "48-hour search duration",
      "Real-time email notifications",
      "Up to 500 leads per request",
      "CSV & JSON export",
      "Advanced matching algorithm",
      "Priority support",
      "Lead scoring analytics",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations",
    features: [
      "Unlimited lead requests",
      "72-hour search duration",
      "Real-time notifications (Email & Webhook)",
      "Unlimited leads per request",
      "All export formats",
      "AI-powered matching algorithm",
      "Dedicated account manager",
      "Advanced analytics & reporting",
      "API access",
      "Custom integrations",
    ],
  },
];

export function Subscription() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || "free");

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      setSelectedPlan(planId);
      return;
    }
    navigate("/payment", { state: { planId } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground">
          Select the perfect plan for your lead generation needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular ? "border-primary border-2" : ""
            } ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}

            {plan.current && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge variant="outline">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2 opacity-50">
                    <span className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground line-through">
                      {limitation}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? "outline" : "default"}
                disabled={plan.current}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.current
                  ? "Current Plan"
                  : selectedPlan === plan.id
                  ? "Selected"
                  : plan.id === "free"
                  ? "Downgrade"
                  : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}