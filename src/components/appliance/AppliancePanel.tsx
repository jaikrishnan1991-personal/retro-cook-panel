import { useApplianceFSM } from "@/hooks/useApplianceFSM";
import { MODES } from "@/lib/appliance-types";
import { RightControlCluster } from "./HardwareButtons";
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

/**
 * V3 fascia: 140 mm × 40 mm => 3.5:1 aspect ratio.
 * LCD inset: 70 mm × 35 mm => 2:1 aspect ratio, occupying the left half.
 * Right half holds the control cluster (D-pad + ON/OFF + Play/Pause + Back).
 */
export const AppliancePanel = ({ onApiReady }: Props) => {
  const api = useApplianceFSM();
  const { state, press, setDown } = api;
  const [clock, setClock] = useState("12:00");

  useEffect(() => { onApiReady?.(api); }, [api, onApiReady]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const mode = state.selectedModeId ? MODES.find((m) => m.id === state.selectedModeId) ?? null : null;

  return (
    <div className="w-full max-w-[840px] mx-auto">
      {/* 140x40mm fascia => 3.5:1 */}
      <div
        className="fascia rounded-xl p-2 flex items-stretch gap-2"
        style={{ aspectRatio: "3.5 / 1" }}
      >
        {/* LCD: 70x35mm => 2:1, takes left ~50% */}
        <div className="flex-[0_0_50%] relative">
          <div
            className="lcd-surface rounded-md w-full h-full overflow-hidden"
            style={{ aspectRatio: "2 / 1" }}
          >
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
                    field={state.autoField}
                  />
                )}
                {state.state === "MANUAL_SETUP" && mode && (
                  <SetupView
                    kind="MANUAL"
                    mode={mode}
                    zoneA={state.zoneA}
                    zoneB={state.zoneB}
                    field={state.manualField}
                  />
                )}
                {(state.state === "RUNNING" || state.state === "PAUSED" || state.state === "DONE") && mode && (
                  <RunView
                    mode={mode}
                    paused={state.state === "PAUSED"}
                    done={state.state === "DONE"}
                    zoneA={state.zoneA}
                    zoneB={state.zoneB}
                    remainingSecA={state.remainingSecA}
                    remainingSecB={state.remainingSecB}
                    liveTempA={state.liveTempA}
                    liveTempB={state.liveTempB}
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
        </div>

        {/* Right control cluster */}
        <div className="flex-1 flex items-center justify-center">
          <RightControlCluster onPress={press} onDown={setDown} />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3 font-pixel tracking-widest">
        140 × 40 mm · LCD 70 × 35 mm · KEYS: ←↑↓→ ENTER ESC SPACE Q · LOCK: HOLD ▲+▼ 3s
      </p>
    </div>
  );
};
