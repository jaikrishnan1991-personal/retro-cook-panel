export type ApplianceState =
  | "BOOT"
  | "MENU"
  | "AUTO_SETUP"
  | "MANUAL_SETUP"
  | "RUNNING"
  | "PAUSED"
  | "DONE"
  | "LOCKED"
  | "ERROR";

export type WifiState = "SEARCHING" | "CONNECTED" | "ERROR";

export type ModeKind = "AUTO" | "MANUAL";

export interface ApplianceMode {
  id: string;
  name: string;
  kind: ModeKind;
  icon: string; // icon key
  defaults: {
    // manual
    temp?: number;
    timeSec?: number;
    // auto
    quantity?: number;
    thickness?: number; // 1-3
    oil?: number;       // 1-3
  };
  ranges?: {
    temp?: [number, number, number]; // min,max,step
    timeSec?: [number, number, number];
    quantity?: [number, number, number];
    thickness?: [number, number, number];
    oil?: [number, number, number];
  };
}

export const MODES: ApplianceMode[] = [
  {
    id: "dosa",
    name: "Dosa",
    kind: "AUTO",
    icon: "dosa",
    defaults: { quantity: 2, thickness: 2, oil: 2 },
    ranges: {
      quantity: [1, 6, 1],
      thickness: [1, 3, 1],
      oil: [1, 3, 1],
    },
  },
  {
    id: "crepe",
    name: "Crepe",
    kind: "AUTO",
    icon: "crepe",
    defaults: { quantity: 2, thickness: 1, oil: 1 },
    ranges: {
      quantity: [1, 6, 1],
      thickness: [1, 3, 1],
      oil: [1, 3, 1],
    },
  },
  {
    id: "steak",
    name: "Steak",
    kind: "MANUAL",
    icon: "steak",
    defaults: { temp: 220, timeSec: 480 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
  {
    id: "chicken",
    name: "Chicken",
    kind: "MANUAL",
    icon: "chicken",
    defaults: { temp: 200, timeSec: 720 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
  {
    id: "burger",
    name: "Burger",
    kind: "MANUAL",
    icon: "burger",
    defaults: { temp: 210, timeSec: 360 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
  {
    id: "fish",
    name: "Fish",
    kind: "MANUAL",
    icon: "fish",
    defaults: { temp: 180, timeSec: 300 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
  {
    id: "sandwich",
    name: "Sandwich",
    kind: "MANUAL",
    icon: "sandwich",
    defaults: { temp: 190, timeSec: 240 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
  {
    id: "hotdog",
    name: "Hotdog",
    kind: "MANUAL",
    icon: "hotdog",
    defaults: { temp: 180, timeSec: 180 },
    ranges: { temp: [60, 280, 5], timeSec: [30, 3600, 30] },
  },
];

export type ErrorCode =
  | "E-T01"
  | "E-T02"
  | "E-T03"
  | "E-K01"
  | "E-K02"
  | "E-K03"
  | "E-S01"
  | "E-N01"
  | "E-N02"
  | "E-C01";

export const ERROR_DETAILS: Record<ErrorCode, { title: string; description: string; autoClearMs?: number }> = {
  "E-T01": { title: "NTC FAULT", description: "NTC Sensor Open Circuit. Heating Disabled." },
  "E-T02": { title: "NTC FAULT", description: "NTC Sensor Short Circuit. Heating Disabled." },
  "E-T03": { title: "THERMAL RUNAWAY", description: "Overheating! Temp > 300C. TCO Backup Engaged." },
  "E-K01": { title: "POSITION FAULT", description: "Kinematic Positioning Failure. Check Limit Switches." },
  "E-K02": { title: "MOTOR JAM", description: "Mechanism Jammed. Unrecoverable Stall." },
  "E-K03": { title: "MOTOR RETRY", description: "Motor Stalled. Attempting Recovery...", autoClearMs: 4000 },
  "E-S01": { title: "LID OPEN", description: "Lid Opened During Active Cycle. Please Close." },
  "E-N01": { title: "NETWORK LOST", description: "Wi-Fi / MQTT Disconnected. Working Offline." },
  "E-N02": { title: "OTA FAILED", description: "Firmware Update Failed. Rolled Back." },
  "E-C01": { title: "PANEL STUCK", description: "Touch Panel Stuck Key Detected." },
};

export type ButtonId =
  | "POWER"
  | "BACK"
  | "START"
  | "PAUSE"
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "SELECT";

export type Zone = "A" | "B" | "BOTH";
