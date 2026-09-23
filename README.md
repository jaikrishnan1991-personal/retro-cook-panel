# Retro Cook Panel

Browser simulator of a cooking appliance's physical front panel, so interaction and display
behaviour can be reviewed before hardware exists.

## What it models

| Component | Models |
|---|---|
| `AppliancePanel` | The panel itself, composing the parts below |
| `HardwareButtons` | Physical button presses and their handling |
| `StatusBar` | Mode, temperature and state indicators |
| `MarqueeText` | The scrolling character display |
| `DebugPanel` | Internal state, for development |

Screen states live in `src/components/appliance/views/`, icons in `icons.tsx`.

## Why a simulator

Panel behaviour — what the display says, when an icon lights, how a press is acknowledged — is
far cheaper to argue about in a browser than on a board. This exists so those decisions are
settled before firmware is written.

## Running it

```bash
npm install
npm run dev
```

## Related

- `v3-rc-and-ir-version2` — the V3 board successor to this panel
- `evo-glow-dash` — same device with connectivity state
