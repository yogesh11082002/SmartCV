
"use client"

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "pro">("free");

  useEffect(() => {
    const storedPlan = localStorage.getItem("subscriptionPlan") as "free" | "pro";
    if (storedPlan) {
      setSubscriptionPlan(storedPlan);
    }
  }, []);

  const handlePlanChange = (plan: "free" | "pro") => {
    if (!user) {
      router.push('/auth');
      return;
    }
    localStorage.setItem("subscriptionPlan", plan);
    setSubscriptionPlan(plan);
  };

  const proPriceMonthly = 15;
  const proPriceYearly = 144;

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Get started with our basic features.",
      features: [
        "1 Resume",
        "Limited AI generations",
        "Access to 3 templates",
        "Standard support"
      ],
      planKey: "free" as const,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? `$${proPriceMonthly}` : `$${proPriceYearly}`,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Unlock the full power of AI for your career.",
      features: [
        "Unlimited Resumes",
        "Unlimited AI generations",
        "Access to all 20+ templates",
        "AI-powered cover letters",
        "Priority support"
      ],
      planKey: "pro" as const,
      popular: true,
    },
    {
      name: "Team",
      price: "Contact Us",
      period: "",
      description: "For career coaches and educational institutions.",
      features: [
        "Everything in Pro",
        "Multi-user management",
        "Custom branding",
        "Dedicated account manager",
      ],
      planKey: "team" as const,
    }
  ];

  const getButton = (planKey: "free" | "pro" | "team") => {
    if (isUserLoading) {
      return <Button className="w-full" disabled><Loader2 className="animate-spin" /></Button>;
    }

    if (planKey === 'team') {
      return <Button asChild className="w-full" variant="secondary"><Link href="/contact">Contact Sales</Link></Button>;
    }
    
    if (subscriptionPlan === planKey) {
      return <Button className="w-full" disabled>Current Plan</Button>;
    }

    if (planKey === 'pro') {
      return <Button className="w-full" onClick={() => handlePlanChange('pro')}>Go Pro</Button>;
    }

    if (planKey === 'free') {
      return <Button className="w-full" variant="secondary" onClick={() => handlePlanChange('free')}>Downgrade to Free</Button>;
    }
    
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Find the Right Plan for You</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent pricing. No hidden fees.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span>Monthly</span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span>Yearly (Save 20%)</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map(plan => (
              <Card key={plan.name} className={`flex flex-col ${(plan.popular && subscriptionPlan !== 'pro') ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
                {(plan.popular && subscriptionPlan !== 'pro') && <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">Most Popular</div>}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {getButton(plan.planKey)}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
