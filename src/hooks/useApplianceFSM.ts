import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  ApplianceMode,
  ApplianceState,
  ButtonId,
  ERROR_DETAILS,
  ErrorCode,
  MODES,
  WifiState,
  Zone,
} from "@/lib/appliance-types";

interface State {
  state: ApplianceState;
  prevState: ApplianceState | null;
  cursorIndex: number; // menu cursor
  selectedModeId: string | null;
  // setup params
  temp: number;
  timeSec: number;
  quantity: number;
  thickness: number;
  oil: number;
  // running
  remainingSec: number;
  progressPct: number; // 0-100 for auto modes
  // misc
  wifi: WifiState;
  zone: Zone;
  childLockHoldStart: number | null; // timestamp
  childLockProgress: number; // 0-1
  error: ErrorCode | null;
  bootProgress: number;
}

type Action =
  | { type: "TICK"; now: number; lockHeld: boolean }
  | { type: "BOOT_DONE" }
  | { type: "WIFI"; wifi: WifiState }
  | { type: "PRESS"; btn: ButtonId }
  | { type: "INJECT_ERROR"; code: ErrorCode }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOCK_HOLD"; ts: number | null }
  | { type: "SET_LOCK_PROGRESS"; v: number }
  | { type: "ENTER_LOCK" }
  | { type: "EXIT_LOCK" }
  | { type: "TOGGLE_ZONE" };

const initial: State = {
  state: "BOOT",
  prevState: null,
  cursorIndex: 0,
  selectedModeId: null,
  temp: 200,
  timeSec: 300,
  quantity: 2,
  thickness: 2,
  oil: 2,
  remainingSec: 0,
  progressPct: 0,
  wifi: "SEARCHING",
  zone: "A",
  childLockHoldStart: null,
  childLockProgress: 0,
  error: null,
  bootProgress: 0,
};

const getMode = (id: string | null): ApplianceMode | null =>
  MODES.find((m) => m.id === id) ?? null;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "TICK": {
      // BOOT progress
      if (s.state === "BOOT") {
        const next = Math.min(100, s.bootProgress + 4);
        return { ...s, bootProgress: next };
      }
      // RUNNING countdown / progress
      if (s.state === "RUNNING") {
        const mode = getMode(s.selectedModeId);
        if (mode?.kind === "MANUAL") {
          const next = Math.max(0, s.remainingSec - 1);
          if (next === 0) return { ...s, remainingSec: 0, state: "DONE" };
          return { ...s, remainingSec: next };
        }
        if (mode?.kind === "AUTO") {
          const next = Math.min(100, s.progressPct + 2);
          if (next >= 100) return { ...s, progressPct: 100, state: "DONE" };
          return { ...s, progressPct: next };
        }
      }
      return s;
    }
    case "BOOT_DONE":
      return { ...s, state: "MENU", bootProgress: 100 };
    case "WIFI":
      return { ...s, wifi: a.wifi };
    case "TOGGLE_ZONE":
      return {
        ...s,
        zone: s.zone === "A" ? "B" : s.zone === "B" ? "BOTH" : "A",
      };
    case "INJECT_ERROR":
      return { ...s, prevState: s.state, state: "ERROR", error: a.code };
    case "CLEAR_ERROR":
      return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
    case "SET_LOCK_HOLD":
      return { ...s, childLockHoldStart: a.ts };
    case "SET_LOCK_PROGRESS":
      return { ...s, childLockProgress: a.v };
    case "ENTER_LOCK":
      return { ...s, prevState: s.state, state: "LOCKED", childLockProgress: 0, childLockHoldStart: null };
    case "EXIT_LOCK":
      return { ...s, state: s.prevState ?? "MENU", prevState: null, childLockProgress: 0, childLockHoldStart: null };
    case "PRESS": {
      // Locked: ignore everything (lock hold handled outside)
      if (s.state === "LOCKED") return s;
      // Error: only POWER or BACK clears
      if (s.state === "ERROR") {
        if (a.btn === "BACK" || a.btn === "POWER") {
          return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
        }
        return s;
      }
      switch (a.btn) {
        case "POWER":
          // soft reset to menu
          return { ...s, state: "MENU", selectedModeId: null, remainingSec: 0, progressPct: 0 };
        case "UP":
          if (s.state === "MENU") {
            return { ...s, cursorIndex: (s.cursorIndex - 1 + MODES.length) % MODES.length };
          }
          return s;
        case "DOWN":
          if (s.state === "MENU") {
            return { ...s, cursorIndex: (s.cursorIndex + 1) % MODES.length };
          }
          return s;
        case "LEFT":
        case "RIGHT": {
          const dir = a.btn === "LEFT" ? -1 : 1;
          if (s.state === "MANUAL_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            const tempStep = mode.ranges?.temp?.[2] ?? 5;
            const timeStep = mode.ranges?.timeSec?.[2] ?? 30;
            return {
              ...s,
              temp: clamp(
                s.temp + dir * tempStep,
                mode.ranges?.temp?.[0] ?? 60,
                mode.ranges?.temp?.[1] ?? 280,
              ),
              timeSec: s.timeSec,
              ...({ _t: timeStep } as object),
            } as State;
          }
          if (s.state === "AUTO_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            const r = mode.ranges?.quantity ?? [1, 6, 1];
            return { ...s, quantity: clamp(s.quantity + dir * r[2], r[0], r[1]) };
          }
          return s;
        }
        case "SELECT": {
          if (s.state === "MENU") {
            const mode = MODES[s.cursorIndex];
            return {
              ...s,
              selectedModeId: mode.id,
              temp: mode.defaults.temp ?? s.temp,
              timeSec: mode.defaults.timeSec ?? s.timeSec,
              quantity: mode.defaults.quantity ?? s.quantity,
              thickness: mode.defaults.thickness ?? s.thickness,
              oil: mode.defaults.oil ?? s.oil,
              state: mode.kind === "AUTO" ? "AUTO_SETUP" : "MANUAL_SETUP",
            };
          }
          return s;
        }
        case "BACK": {
          if (s.state === "AUTO_SETUP" || s.state === "MANUAL_SETUP") {
            return { ...s, state: "MENU", selectedModeId: null };
          }
          if (s.state === "RUNNING" || s.state === "PAUSED" || s.state === "DONE") {
            return { ...s, state: "MENU", selectedModeId: null, remainingSec: 0, progressPct: 0 };
          }
          return s;
        }
        case "START": {
          if (s.state === "MANUAL_SETUP") {
            return { ...s, state: "RUNNING", remainingSec: s.timeSec, progressPct: 0 };
          }
          if (s.state === "AUTO_SETUP") {
            return { ...s, state: "RUNNING", progressPct: 0, remainingSec: 0 };
          }
          if (s.state === "PAUSED") return { ...s, state: "RUNNING" };
          return s;
        }
        case "PAUSE": {
          if (s.state === "RUNNING") return { ...s, state: "PAUSED" };
          if (s.state === "PAUSED") return { ...s, state: "RUNNING" };
          return s;
        }
      }
      return s;
    }
  }
}

const LOCK_HOLD_MS = 3000;

export function useApplianceFSM() {
  const [state, dispatch] = useReducer(reducer, initial);

  // physical button down map for combo detection (BACK + PAUSE)
  const downRef = useRef<Record<ButtonId, boolean>>({
    POWER: false, BACK: false, START: false, PAUSE: false,
    UP: false, DOWN: false, LEFT: false, RIGHT: false, SELECT: false,
  });
  const lockStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Boot sequence
  useEffect(() => {
    const t1 = setTimeout(() => dispatch({ type: "WIFI", wifi: "CONNECTED" }), 1800);
    const t2 = setTimeout(() => dispatch({ type: "BOOT_DONE" }), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 1Hz tick for cooking countdown
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: "TICK", now: Date.now(), lockHeld: false });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Boot progress faster tick
  useEffect(() => {
    if (state.state !== "BOOT") return;
    const id = setInterval(() => dispatch({ type: "TICK", now: Date.now(), lockHeld: false }), 80);
    return () => clearInterval(id);
  }, [state.state]);

  // Auto-clear errors with autoClearMs
  useEffect(() => {
    if (state.state !== "ERROR" || !state.error) return;
    const def = ERROR_DETAILS[state.error];
    if (def.autoClearMs) {
      const id = setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), def.autoClearMs);
      return () => clearTimeout(id);
    }
  }, [state.state, state.error]);

  // Lock combo loop using rAF
  useEffect(() => {
    const loop = () => {
      const both = downRef.current.BACK && downRef.current.PAUSE;
      if (both) {
        if (lockStartRef.current == null) lockStartRef.current = performance.now();
        const elapsed = performance.now() - lockStartRef.current;
        const progress = Math.min(1, elapsed / LOCK_HOLD_MS);
        dispatch({ type: "SET_LOCK_PROGRESS", v: progress });
        if (progress >= 1) {
          // toggle
          if (state.state === "LOCKED") dispatch({ type: "EXIT_LOCK" });
          else dispatch({ type: "ENTER_LOCK" });
          lockStartRef.current = null;
          downRef.current.BACK = false;
          downRef.current.PAUSE = false;
          dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
        }
      } else {
        if (lockStartRef.current != null) {
          lockStartRef.current = null;
          dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.state]);

  const press = useCallback((btn: ButtonId) => {
    dispatch({ type: "PRESS", btn });
  }, []);

  const setDown = useCallback((btn: ButtonId, isDown: boolean) => {
    downRef.current[btn] = isDown;
  }, []);

  const injectError = useCallback((code: ErrorCode) => {
    dispatch({ type: "INJECT_ERROR", code });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
  const toggleZone = useCallback(() => dispatch({ type: "TOGGLE_ZONE" }), []);
  const setWifi = useCallback((w: WifiState) => dispatch({ type: "WIFI", wifi: w }), []);

  return { state, press, setDown, injectError, clearError, toggleZone, setWifi };
}
