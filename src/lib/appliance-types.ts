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
  icon: string;
  defaults: {
    temp?: number;
    timeSec?: number;
    quantity?: number;
    thickness?: number; // 1-5 for Dosa/Crepe
    oil?: number;       // 0-3 (None/Low/Med/High)
  };
  ranges?: {
    temp?: [number, number, number];
    timeSec?: [number, number, number];
    quantity?: [number, number, number];
    thickness?: [number, number, number];
    oil?: [number, number, number];
  };
}

// Manual ranges per V3 spec: 80–300°C step 5, 00:15–99:45 step 15s
const MANUAL_TEMP: [number, number, number] = [80, 300, 5];
const MANUAL_TIME: [number, number, number] = [15, 99 * 60 + 45, 15];

export const MODES: ApplianceMode[] = [
  {
    id: "dosa",
    name: "Dosa",
    kind: "AUTO",
    icon: "dosa",
    defaults: { quantity: 2, thickness: 3, oil: 1 },
    ranges: {
      quantity: [1, 99, 1],
      thickness: [1, 5, 1],
      oil: [0, 3, 1],
    },
  },
  {
    id: "crepe",
    name: "Crepe",
    kind: "AUTO",
    icon: "crepe",
    defaults: { quantity: 2, thickness: 2, oil: 1 },
    ranges: {
      quantity: [1, 99, 1],
      thickness: [1, 5, 1],
      oil: [0, 3, 1],
    },
  },
  { id: "steak",    name: "Steak",    kind: "MANUAL", icon: "steak",    defaults: { temp: 220, timeSec: 480 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "chicken",  name: "Chicken",  kind: "MANUAL", icon: "chicken",  defaults: { temp: 200, timeSec: 720 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "burger",   name: "Burger",   kind: "MANUAL", icon: "burger",   defaults: { temp: 210, timeSec: 360 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "fish",     name: "Fish",     kind: "MANUAL", icon: "fish",     defaults: { temp: 180, timeSec: 300 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "sandwich", name: "Sandwich", kind: "MANUAL", icon: "sandwich", defaults: { temp: 190, timeSec: 240 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "hotdog",   name: "Hotdog",   kind: "MANUAL", icon: "hotdog",   defaults: { temp: 180, timeSec: 180 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
  { id: "grill",    name: "Grill",    kind: "MANUAL", icon: "grill",    defaults: { temp: 240, timeSec: 600 }, ranges: { temp: MANUAL_TEMP, timeSec: MANUAL_TIME } },
];

export type ErrorCode =
  | "E-T01" | "E-T02" | "E-T03"
  | "E-K01" | "E-K02" | "E-K03"
  | "E-S01" | "E-N01" | "E-N02" | "E-C01";

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

// V3 buttons. Note: PAUSE doubles as Play/Pause toggle. SELECT = OK on D-pad center.
export type ButtonId =
  | "POWER"
  | "BACK"
  | "START"   // kept for keyboard "S" alias of play
  | "PAUSE"   // play/pause toggle
  | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SELECT";

export type Zone = "A" | "B" | "BOTH";

export const OIL_LABELS = ["None", "Low", "Med", "High"] as const;
