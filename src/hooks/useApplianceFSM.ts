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

// Manual setup focus: per-zone ON toggle + temp + time
export type ManualField = "A_ON" | "A_TEMP" | "A_TIME" | "B_ON" | "B_TEMP" | "B_TIME";
export type AutoField = "QTY" | "THICK" | "OIL";

interface ZoneParams {
  temp: number;
  timeSec: number;
  lastTimeSec: number; // remembered so toggling OFF→ON restores
}

interface State {
  state: ApplianceState;
  prevState: ApplianceState | null;
  cursorIndex: number;
  selectedModeId: string | null;
  // Per-zone manual params
  zoneA: ZoneParams;
  zoneB: ZoneParams;
  // Auto params
  quantity: number;
  thickness: number;
  oil: number;
  // Field cursors
  manualField: ManualField;
  autoField: AutoField;
  // Running telemetry
  remainingSecA: number;
  remainingSecB: number;
  liveTempA: number;
  liveTempB: number;
  progressPct: number;
  // Misc
  wifi: WifiState;
  zone: Zone; // derived display state
  childLockHoldStart: number | null;
  childLockProgress: number;
  error: ErrorCode | null;
  bootProgress: number;
}

type Action =
  | { type: "TICK_SLOW" }
  | { type: "TICK_FAST" }
  | { type: "BOOT_DONE" }
  | { type: "WIFI"; wifi: WifiState }
  | { type: "PRESS"; btn: ButtonId }
  | { type: "INJECT_ERROR"; code: ErrorCode }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOCK_PROGRESS"; v: number }
  | { type: "ENTER_LOCK" }
  | { type: "EXIT_LOCK" }
  | { type: "TOGGLE_ZONE" };

const initial: State = {
  state: "BOOT",
  prevState: null,
  cursorIndex: 0,
  selectedModeId: null,
  zoneA: { temp: 220, timeSec: 480 },
  zoneB: { temp: 220, timeSec: 480 },
  quantity: 2,
  thickness: 3,
  oil: 1,
  manualField: "A_TEMP",
  autoField: "QTY",
  remainingSecA: 0,
  remainingSecB: 0,
  liveTempA: 25,
  liveTempB: 25,
  progressPct: 0,
  wifi: "SEARCHING",
  zone: "BOTH",
  childLockHoldStart: null,
  childLockProgress: 0,
  error: null,
  bootProgress: 0,
};

const getMode = (id: string | null): ApplianceMode | null =>
  MODES.find((m) => m.id === id) ?? null;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const MANUAL_FIELDS: ManualField[] = ["A_TEMP", "A_TIME", "B_TEMP", "B_TIME"];
const AUTO_FIELDS: AutoField[] = ["QTY", "THICK", "OIL"];

// Derive zone display from per-zone enabled-ness (timeSec > 0)
const deriveZone = (s: State): Zone => {
  const a = s.zoneA.timeSec > 0;
  const b = s.zoneB.timeSec > 0;
  if (a && b) return "BOTH";
  if (a) return "A";
  if (b) return "B";
  return "BOTH";
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "TICK_SLOW": {
      if (s.state === "RUNNING") {
        const mode = getMode(s.selectedModeId);
        if (mode?.kind === "MANUAL") {
          const ra = Math.max(0, (s.remainingSecA > 0 ? s.remainingSecA - 1 : 0));
          const rb = Math.max(0, (s.remainingSecB > 0 ? s.remainingSecB - 1 : 0));
          // Live temp climb toward target, fall when zone disabled
          const climb = (cur: number, target: number, enabled: boolean) => {
            if (!enabled) return Math.max(25, cur - 3);
            if (cur < target) return Math.min(target, cur + 8);
            // mild fluctuation around target
            return target + (Math.random() < 0.5 ? -1 : 1);
          };
          const aOn = s.zoneA.timeSec > 0 && ra > 0;
          const bOn = s.zoneB.timeSec > 0 && rb > 0;
          const next: State = {
            ...s,
            remainingSecA: ra,
            remainingSecB: rb,
            liveTempA: climb(s.liveTempA, s.zoneA.temp, aOn),
            liveTempB: climb(s.liveTempB, s.zoneB.temp, bOn),
          };
          const aDone = s.zoneA.timeSec === 0 || ra === 0;
          const bDone = s.zoneB.timeSec === 0 || rb === 0;
          if (aDone && bDone) return { ...next, state: "DONE" };
          return next;
        }
        if (mode?.kind === "AUTO") {
          const np = Math.min(100, s.progressPct + 2);
          if (np >= 100) return { ...s, progressPct: 100, state: "DONE" };
          return { ...s, progressPct: np };
        }
      }
      return s;
    }
    case "TICK_FAST": {
      if (s.state === "BOOT") return { ...s, bootProgress: Math.min(100, s.bootProgress + 4) };
      return s;
    }
    case "BOOT_DONE":
      return { ...s, state: "MENU", bootProgress: 100 };
    case "WIFI":
      return { ...s, wifi: a.wifi };
    case "TOGGLE_ZONE": {
      // Debug helper: cycle which zones have time>0
      const order: Zone[] = ["A", "B", "BOTH"];
      const cur = deriveZone(s);
      const next = order[(order.indexOf(cur) + 1) % order.length];
      const def = 480;
      return {
        ...s,
        zoneA: { ...s.zoneA, timeSec: next === "B" ? 0 : (s.zoneA.timeSec || def) },
        zoneB: { ...s.zoneB, timeSec: next === "A" ? 0 : (s.zoneB.timeSec || def) },
        zone: next,
      };
    }
    case "INJECT_ERROR":
      return { ...s, prevState: s.state, state: "ERROR", error: a.code };
    case "CLEAR_ERROR":
      return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
    case "SET_LOCK_PROGRESS":
      return { ...s, childLockProgress: a.v };
    case "ENTER_LOCK":
      return { ...s, prevState: s.state, state: "LOCKED", childLockProgress: 0, childLockHoldStart: null };
    case "EXIT_LOCK":
      return { ...s, state: s.prevState ?? "MENU", prevState: null, childLockProgress: 0, childLockHoldStart: null };
    case "PRESS": {
      if (s.state === "LOCKED") return s;
      if (s.state === "ERROR") {
        if (a.btn === "BACK" || a.btn === "POWER") {
          return { ...s, state: s.prevState ?? "MENU", error: null, prevState: null };
        }
        return s;
      }
      switch (a.btn) {
        case "POWER":
          return { ...s, state: "MENU", selectedModeId: null, progressPct: 0 };
        case "UP":
        case "DOWN": {
          const dir = a.btn === "UP" ? 1 : -1; // up = increment value
          if (s.state === "MENU") {
            // In menu, up/down scrolls list
            const d = a.btn === "UP" ? -1 : 1;
            return { ...s, cursorIndex: (s.cursorIndex + d + MODES.length) % MODES.length };
          }
          if (s.state === "MANUAL_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            const tempR = mode.ranges?.temp ?? [80, 300, 5];
            const timeR = mode.ranges?.timeSec ?? [15, 5985, 15];
            const f = s.manualField;
            if (f === "A_TEMP") return { ...s, zoneA: { ...s.zoneA, temp: clamp(s.zoneA.temp + dir * tempR[2], tempR[0], tempR[1]) } };
            if (f === "A_TIME") {
              const allowZero = true;
              const min = allowZero ? 0 : timeR[0];
              const next = clamp(s.zoneA.timeSec + dir * timeR[2], min, timeR[1]);
              const nz = next < timeR[0] && next !== 0 ? 0 : next;
              return { ...s, zoneA: { ...s.zoneA, timeSec: nz }, zone: deriveZone({ ...s, zoneA: { ...s.zoneA, timeSec: nz } }) };
            }
            if (f === "B_TEMP") return { ...s, zoneB: { ...s.zoneB, temp: clamp(s.zoneB.temp + dir * tempR[2], tempR[0], tempR[1]) } };
            if (f === "B_TIME") {
              const next = clamp(s.zoneB.timeSec + dir * timeR[2], 0, timeR[1]);
              const nz = next < timeR[0] && next !== 0 ? 0 : next;
              return { ...s, zoneB: { ...s.zoneB, timeSec: nz }, zone: deriveZone({ ...s, zoneB: { ...s.zoneB, timeSec: nz } }) };
            }
            return s;
          }
          if (s.state === "AUTO_SETUP") {
            const mode = getMode(s.selectedModeId);
            if (!mode) return s;
            const f = s.autoField;
            if (f === "QTY") {
              const r = mode.ranges?.quantity ?? [1, 99, 1];
              return { ...s, quantity: clamp(s.quantity + dir * r[2], r[0], r[1]) };
            }
            if (f === "THICK") {
              const r = mode.ranges?.thickness ?? [1, 5, 1];
              return { ...s, thickness: clamp(s.thickness + dir * r[2], r[0], r[1]) };
            }
            if (f === "OIL") {
              const r = mode.ranges?.oil ?? [0, 3, 1];
              return { ...s, oil: clamp(s.oil + dir * r[2], r[0], r[1]) };
            }
          }
          return s;
        }
        case "LEFT":
        case "RIGHT": {
          const dir = a.btn === "LEFT" ? -1 : 1;
          if (s.state === "MANUAL_SETUP") {
            const i = MANUAL_FIELDS.indexOf(s.manualField);
            const n = (i + dir + MANUAL_FIELDS.length) % MANUAL_FIELDS.length;
            return { ...s, manualField: MANUAL_FIELDS[n] };
          }
          if (s.state === "AUTO_SETUP") {
            const i = AUTO_FIELDS.indexOf(s.autoField);
            const n = (i + dir + AUTO_FIELDS.length) % AUTO_FIELDS.length;
            return { ...s, autoField: AUTO_FIELDS[n] };
          }
          if (s.state === "MENU") {
            // also allow horizontal scrolling in menu
            return { ...s, cursorIndex: (s.cursorIndex + dir + MODES.length) % MODES.length };
          }
          return s;
        }
        case "SELECT": {
          if (s.state === "MENU") {
            const mode = MODES[s.cursorIndex];
            const isAuto = mode.kind === "AUTO";
            return {
              ...s,
              selectedModeId: mode.id,
              zoneA: { temp: mode.defaults.temp ?? 220, timeSec: mode.defaults.timeSec ?? 480 },
              zoneB: { temp: mode.defaults.temp ?? 220, timeSec: mode.defaults.timeSec ?? 480 },
              quantity: mode.defaults.quantity ?? s.quantity,
              thickness: mode.defaults.thickness ?? s.thickness,
              oil: mode.defaults.oil ?? s.oil,
              manualField: "A_TEMP",
              autoField: "QTY",
              zone: "BOTH",
              state: isAuto ? "AUTO_SETUP" : "MANUAL_SETUP",
            };
          }
          // OK from setup also starts cooking
          if (s.state === "MANUAL_SETUP") {
            return startManual(s);
          }
          if (s.state === "AUTO_SETUP") {
            return { ...s, state: "RUNNING", progressPct: 0 };
          }
          return s;
        }
        case "BACK": {
          if (s.state === "AUTO_SETUP" || s.state === "MANUAL_SETUP") {
            return { ...s, state: "MENU", selectedModeId: null };
          }
          if (s.state === "RUNNING" || s.state === "PAUSED" || s.state === "DONE") {
            return { ...s, state: "MENU", selectedModeId: null, progressPct: 0 };
          }
          return s;
        }
        case "START":
        case "PAUSE": {
          // Play/Pause toggle
          if (s.state === "MANUAL_SETUP") return startManual(s);
          if (s.state === "AUTO_SETUP") return { ...s, state: "RUNNING", progressPct: 0 };
          if (s.state === "RUNNING") return { ...s, state: "PAUSED" };
          if (s.state === "PAUSED") return { ...s, state: "RUNNING" };
          return s;
        }
      }
      return s;
    }
  }
}

function startManual(s: State): State {
  return {
    ...s,
    state: "RUNNING",
    remainingSecA: s.zoneA.timeSec,
    remainingSecB: s.zoneB.timeSec,
    liveTempA: 25,
    liveTempB: 25,
    progressPct: 0,
  };
}

const LOCK_HOLD_MS = 3000;

export function useApplianceFSM() {
  const [state, dispatch] = useReducer(reducer, initial);

  const downRef = useRef<Record<ButtonId, boolean>>({
    POWER: false, BACK: false, START: false, PAUSE: false,
    UP: false, DOWN: false, LEFT: false, RIGHT: false, SELECT: false,
  });
  const lockStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => dispatch({ type: "WIFI", wifi: "CONNECTED" }), 1800);
    const t2 = setTimeout(() => dispatch({ type: "BOOT_DONE" }), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "TICK_SLOW" }), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (state.state !== "BOOT") return;
    const id = setInterval(() => dispatch({ type: "TICK_FAST" }), 80);
    return () => clearInterval(id);
  }, [state.state]);

  useEffect(() => {
    if (state.state !== "ERROR" || !state.error) return;
    const def = ERROR_DETAILS[state.error];
    if (def.autoClearMs) {
      const id = setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), def.autoClearMs);
      return () => clearTimeout(id);
    }
  }, [state.state, state.error]);

  // V3 child lock: hold UP + DOWN for 3s
  useEffect(() => {
    const loop = () => {
      const both = downRef.current.UP && downRef.current.DOWN;
      if (both) {
        if (lockStartRef.current == null) lockStartRef.current = performance.now();
        const elapsed = performance.now() - lockStartRef.current;
        const progress = Math.min(1, elapsed / LOCK_HOLD_MS);
        dispatch({ type: "SET_LOCK_PROGRESS", v: progress });
        if (progress >= 1) {
          if (state.state === "LOCKED") dispatch({ type: "EXIT_LOCK" });
          else dispatch({ type: "ENTER_LOCK" });
          lockStartRef.current = null;
          downRef.current.UP = false;
          downRef.current.DOWN = false;
          dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
        }
      } else if (lockStartRef.current != null) {
        lockStartRef.current = null;
        dispatch({ type: "SET_LOCK_PROGRESS", v: 0 });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.state]);

  const press = useCallback((btn: ButtonId) => {
    // Block press during lock-hold combo so values don't change while activating lock
    if (downRef.current.UP && downRef.current.DOWN) return;
    dispatch({ type: "PRESS", btn });
  }, []);

  const setDown = useCallback((btn: ButtonId, isDown: boolean) => {
    downRef.current[btn] = isDown;
  }, []);

  const injectError = useCallback((code: ErrorCode) => dispatch({ type: "INJECT_ERROR", code }), []);
  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
  const toggleZone = useCallback(() => dispatch({ type: "TOGGLE_ZONE" }), []);
  const setWifi = useCallback((w: WifiState) => dispatch({ type: "WIFI", wifi: w }), []);

  return { state, press, setDown, injectError, clearError, toggleZone, setWifi };
}
