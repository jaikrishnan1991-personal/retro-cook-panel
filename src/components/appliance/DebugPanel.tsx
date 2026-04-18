import { ERROR_DETAILS, ErrorCode, WifiState } from "@/lib/appliance-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  injectError: (c: ErrorCode) => void;
  clearError: () => void;
  setWifi: (w: WifiState) => void;
  toggleZone: () => void;
}

export const DebugPanel = ({ injectError, clearError, setWifi, toggleZone }: Props) => {
  const codes = Object.keys(ERROR_DETAILS) as ErrorCode[];
  return (
    <Card className="p-4 bg-card/60 backdrop-blur border-border/60">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-pixel text-lg tracking-wider">DEBUG / FAULT INJECTION</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setWifi("CONNECTED")}>WiFi: ON</Button>
          <Button size="sm" variant="secondary" onClick={() => setWifi("SEARCHING")}>Search</Button>
          <Button size="sm" variant="secondary" onClick={() => setWifi("ERROR")}>Offline</Button>
          <Button size="sm" variant="outline" onClick={toggleZone}>Cycle Zone</Button>
          <Button size="sm" variant="outline" onClick={clearError}>Clear Err</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {codes.map((c) => (
          <Button
            key={c}
            size="sm"
            variant="destructive"
            className="font-pixel justify-start text-left"
            onClick={() => injectError(c)}
          >
            <span className="font-bold mr-1">{c}</span>
            <span className="opacity-80 text-xs truncate">{ERROR_DETAILS[c].title}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Tip: Hold <kbd className="px-1 border border-border rounded">BACK</kbd> + <kbd className="px-1 border border-border rounded">PAUSE</kbd> for 3s to toggle Child Lock.
      </p>
    </Card>
  );
};
