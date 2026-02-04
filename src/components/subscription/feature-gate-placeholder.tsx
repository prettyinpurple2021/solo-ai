import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Zap, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureGatePlaceholderProps {
  title?: string;
  description?: string;
  tier?: 'solo' | 'pro' | 'agency';
  icon?: React.ReactNode;
}

export function FeatureGatePlaceholder({
  title = "Premium Feature",
  description = "This feature requires a premium subscription. Upgrade your plan to unlock.",
  tier = 'solo',
  icon
}: FeatureGatePlaceholderProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  return (
    <Card className="max-w-md mx-auto my-12 border-dashed">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            {icon || (tier === 'agency' ? <Crown className="h-8 w-8 text-primary" /> : <Zap className="h-8 w-8 text-primary" />)}
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Lock className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription className="text-base max-w-sm mx-auto mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full font-semibold" 
            size="lg"
            onClick={handleUpgrade}
          >
            Upgrade to Unlock
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          30-day money-back guarantee. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}
