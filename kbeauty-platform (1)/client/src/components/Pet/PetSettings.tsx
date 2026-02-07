import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function PetSettings() {
  const [consent, setConsent] = useState(false);
  const [useSprites, setUseSprites] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pet:consent");
      setConsent(raw ? JSON.parse(raw) : false);
      const rawSprites = localStorage.getItem("pet:useSprites");
      setUseSprites(rawSprites ? JSON.parse(rawSprites) : false);
    } catch {}
  }, []);

  const toggleConsent = (value: boolean) => {
    setConsent(value);
    try { localStorage.setItem("pet:consent", JSON.stringify(value)); } catch {}
  };

  const clearData = () => {
    const keys = [
      "pet:moodLogs",
      "pet:foodLogs",
      "pet:lastCheckIn",
      "pet:lastPeriod",
      "pet:cycleLength",
      "pet:useSprites",
    ];
    try { keys.forEach(k => localStorage.removeItem(k)); } catch {}
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="fixed bottom-6 left-6 rounded-full">Pet Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pet Privacy & Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Allow health-adjacent logging</span>
            <Switch checked={consent} onCheckedChange={toggleConsent} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Use sprite cat (experimental)</span>
            <Switch checked={useSprites} onCheckedChange={(v) => {
              setUseSprites(v);
              try { localStorage.setItem("pet:useSprites", JSON.stringify(v)); } catch {}
            }} />
          </div>
          <Button variant="outline" onClick={clearData}>Clear Pet Data</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
