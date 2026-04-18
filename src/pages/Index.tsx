import { useState } from "react";
import { AppliancePanel } from "@/components/appliance/AppliancePanel";
import { DebugPanel } from "@/components/appliance/DebugPanel";
import { useApplianceFSM } from "@/hooks/useApplianceFSM";

const Index = () => {
  const [api, setApi] = useState<ReturnType<typeof useApplianceFSM> | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4">
      <header className="max-w-[920px] mx-auto mb-6 text-center">
        <h1 className="font-pixel text-3xl md:text-4xl tracking-widest text-primary">
          DOT-MATRIX COOKING APPLIANCE
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive 230 × 50 mm LCD control panel simulator
        </p>
      </header>

      <main className="space-y-6">
        <AppliancePanel onApiReady={setApi} />
        {api && (
          <div className="max-w-[920px] mx-auto">
            <DebugPanel
              injectError={api.injectError}
              clearError={api.clearError}
              setWifi={api.setWifi}
              toggleZone={api.toggleZone}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
