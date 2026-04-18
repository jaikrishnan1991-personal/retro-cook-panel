import { useApplianceFSM } from "@/hooks/useApplianceFSM";
import { MODES } from "@/lib/appliance-types";
import { HardwareButtons, RightDPad } from "./HardwareButtons";
import { StatusBar } from "./StatusBar";
import { MenuView } from "./views/MenuView";
import { SetupView } from "./views/SetupView";
import { RunView } from "./views/RunView";
import { ErrorView } from "./views/ErrorView";
import { BootView, ChildLockHoldOverlay, ChildLockView } from "./views/ChildLockView";
import { useEffect, useState } from "react";

interface Props {
  onApiReady?: (api: ReturnType<typeof useApplianceFSM>) => void;
}

export const AppliancePanel = ({ onApiReady }: Props) => {
  const api = useApplianceFSM();
  const { state, press, setDown } = api;
  const [clock, setClock] = useState("12:00");

  useEffect(() => {
    onApiReady?.(api);
  }, [api, onApiReady]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const mode = state.selectedModeId
    ? MODES.find((m) => m.id === state.selectedModeId) ?? null
    : null;

  return (
    <div className="w-full max-w-[920px] mx-auto">
      {/* The fascia: 230mm x 50mm => 4.6:1 aspect ratio */}
      <div
        className="fascia rounded-xl p-3 flex items-stretch gap-3"
        style={{ aspectRatio: "4.6 / 1" }}
      >
        {/* LEFT BUTTONS */}
        <div className="flex items-center">
          <HardwareButtons onPress={press} onDown={setDown} />
        </div>

        {/* LCD */}
        <div className="flex-1 relative lcd-surface rounded-md">
          <div className="lcd-content absolute inset-0 flex flex-col">
            <StatusBar
              wifi={state.wifi}
              locked={state.state === "LOCKED"}
              zone={state.zone}
              clock={clock}
            />
            <div className="flex-1 relative">
              {state.state === "BOOT" && <BootView progress={state.bootProgress} />}
              {state.state === "MENU" && <MenuView cursor={state.cursorIndex} />}
              {state.state === "AUTO_SETUP" && mode && (
                <SetupView
                  kind="AUTO"
                  mode={mode}
                  quantity={state.quantity}
                  thickness={state.thickness}
                  oil={state.oil}
                  zone={state.zone}
                  field={state.autoField}
                />
              )}
              {state.state === "MANUAL_SETUP" && mode && (
                <SetupView
                  kind="MANUAL"
                  mode={mode}
                  temp={state.temp}
                  timeSec={state.timeSec}
                  zone={state.zone}
                  field={state.manualField}
                />
              )}
              {(state.state === "RUNNING" || state.state === "PAUSED" || state.state === "DONE") && mode && (
                <RunView
                  mode={mode}
                  paused={state.state === "PAUSED"}
                  done={state.state === "DONE"}
                  temp={state.temp}
                  remainingSec={state.remainingSec}
                  progressPct={state.progressPct}
                />
              )}
              {state.state === "ERROR" && state.error && <ErrorView code={state.error} />}
              {state.state === "LOCKED" && <ChildLockView />}
              {state.state !== "LOCKED" && state.childLockProgress > 0.05 && (
                <ChildLockHoldOverlay progress={state.childLockProgress} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT DPAD */}
        <div className="flex items-center">
          <RightDPad onPress={press} onDown={setDown} />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3 font-pixel tracking-widest">
        230 × 50 mm · DOT-MATRIX LCD · KEYS: ←↑↓→ ENTER ESC S P Q
      </p>
    </div>
  );
};
