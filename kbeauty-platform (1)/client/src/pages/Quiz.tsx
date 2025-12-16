import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const SKIN_TYPES = [
  { value: "dry", label: "Dry", description: "Tight, flaky, sometimes rough" },
  { value: "oily", label: "Oily", description: "Shiny, large pores, prone to breakouts" },
  { value: "combination", label: "Combination", description: "Oily T-zone, dry cheeks" },
  { value: "normal", label: "Normal", description: "Balanced, not too oily or dry" },
  { value: "sensitive", label: "Sensitive", description: "Easily irritated, reactive" },
];

const CONCERNS = [
  { value: "hydration", label: "Hydration" },
  { value: "brightening", label: "Brightening" },
  { value: "anti-aging", label: "Anti-Aging" },
  { value: "acne", label: "Acne" },
  { value: "sensitive", label: "Sensitivity" },
  { value: "pore-care", label: "Pore Care" },
  { value: "oil-control", label: "Oil Control" },
  { value: "barrier-repair", label: "Barrier Repair" },
];

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState("");
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [secondaryConcerns, setSecondaryConcerns] = useState<string[]>([]);
  
  const submitQuiz = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Quiz completed! Here are your recommendations");
      setLocation("/quiz/results");
    },
    onError: () => {
      toast.error("Failed to submit quiz");
    },
  });

  const handleSubmit = () => {
    if (!skinType || !primaryConcern) {
      toast.error("Please complete all required fields");
      return;
    }
    
    submitQuiz.mutate({
      skinType,
      primaryConcern,
      secondaryConcerns,
    });
  };

  const toggleSecondaryConcern = (concern: string) => {
    setSecondaryConcerns(prev =>
      prev.includes(concern)
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-12">
          <div className="container max-w-2xl">
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">Skin Quiz</h1>
              <p className="text-muted-foreground">
                Answer a few questions to get personalized product recommendations
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? "w-12 bg-primary" : "w-8 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="container max-w-2xl py-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>What's your skin type?</CardTitle>
                <CardDescription>
                  Choose the option that best describes your skin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={skinType} onValueChange={setSkinType}>
                  <div className="space-y-3">
                    {SKIN_TYPES.map((type) => (
                      <div key={type.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!skinType}
                    className="rounded-full"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>What's your main skin concern?</CardTitle>
                <CardDescription>
                  Select your primary concern and any additional ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Primary Concern *</Label>
                  <RadioGroup value={primaryConcern} onValueChange={setPrimaryConcern}>
                    <div className="grid grid-cols-2 gap-3">
                      {CONCERNS.map((concern) => (
                        <div key={concern.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                          <RadioGroupItem value={concern.value} id={`primary-${concern.value}`} />
                          <Label htmlFor={`primary-${concern.value}`} className="cursor-pointer">
                            {concern.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Secondary Concerns (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CONCERNS.filter(c => c.value !== primaryConcern).map((concern) => (
                      <div key={concern.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                        <Checkbox
                          id={`secondary-${concern.value}`}
                          checked={secondaryConcerns.includes(concern.value)}
                          onCheckedChange={() => toggleSecondaryConcern(concern.value)}
                        />
                        <Label htmlFor={`secondary-${concern.value}`} className="cursor-pointer">
                          {concern.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!primaryConcern || submitQuiz.isPending}
                    className="rounded-full"
                  >
                    {submitQuiz.isPending ? "Analyzing..." : "Get Recommendations"}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
