# Waypoint

Zero-Trust, WebMCP-powered co-browsing and remote customer support.

Traditional co-browsing tools stream DOM trees or broadcast video feeds over WebRTC. That approach hands support representatives raw access to customer screens, including credit card numbers, passwords, and private inputs.

Waypoint replaces screen-sharing with bounded tool execution. Using Chrome's WebMCP API (`document.modelContext`) and an edge WebSocket relay, the customer's tab exposes structured actions to support representatives. Representatives cannot read unexposed DOM nodes or execute changes unilaterally. Every state mutation requires explicit, client-side customer approval before running.

---

## Key Architecture

```
┌────────────────────────────────────────────────────────┐
│                      Customer Tab                      │
│                                                        │
│  document.modelContext                                 │
│  ├── get_order_details (read-only)                     │
│  ├── update_shipping_address (gated)                   │
│  └── apply_promo_code (gated)                          │
│                                                        │
│               ▲                        │               │
│     approval  │                        │ state sync    │
│     required  │                        ▼               │
│         ┌───────────┐           ┌──────────────┐       │
│         │  Client   │           │ Native State │       │
│         │ Gate UI   │           │ (Local DOM)  │       │
│         └───────────┘           └──────────────┘       │
└───────────────┬────────────────────────▲───────────────┘
                │                        │
       JSON     ▼                        │
    Protocol ┌──────────────────────────────┐
             │    PartyKit Edge Relay       │
             │   (Zero-storage routing)     │
             └──────────────┬───────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Support Rep Console                   │
│                                                        │
│  ├── Column 1: Live State Mirror (Read-Only)          │
│  ├── Column 2: Tool Discovery & Proposal Forms         │
│  └── Column 3: Event Stream & Audit Log                │
│                                                        │
│  * Zero DOM visibility                                 │
│  * Cannot execute actions directly                     │
│  * Can only propose typed arguments                    │
└────────────────────────────────────────────────────────┘
```

### 1. Structural Confinement
The support representative's tab has zero access to the customer's DOM, cookies, or session storage. The representative sees only:
1. Sanitized order state emitted by read-only tools.
2. The typed parameter schemas of registered tools.

### 2. Human Gate Flow
When a representative fills out a form to assist a customer (e.g., updating a shipping address or applying a promo code), their console emits an `action_proposed` event. The customer tab displays a native confirmation modal showing:
- The tool name.
- The exact proposed arguments.
- An explicit **Approve** or **Reject** decision.

Only if the customer approves does the customer tab call `tool.execute(args)` locally.

### 3. Edge WebSocket Relay
The PartyKit relay (`party/index.ts`) runs on Cloudflare Workers and acts as a blind message router:
- Rooms are keyed by short ephemeral codes (e.g., `K2X85S`).
- The relay stores no customer credentials, credit cards, or DOM snapshots.
- When either party disconnects, cached state clears immediately and the peer receives a `session_ended` notification.

### 4. Dual AI and Human Compatibility
Because tools register on `document.modelContext`, browser-embedded assistants (like Chrome's Gemini side panel) and human support reps interact with the exact same capabilities and security boundaries.

---

## WebMCP Tools

| Tool | Type | Schema | Purpose |
| :--- | :--- | :--- | :--- |
| `get_order_details` | Read-only | `{}` | Streams cart items, pricing, recipient, and checkout errors to the support console. Runs automatically without gating. |
| `update_shipping_address` | Mutating | `{ name, street, city, zip }` | Validates postal format (5-digit US ZIP) and updates delivery details upon customer approval. |
| `apply_promo_code` | Mutating | `{ code }` | Validates coupon rules (`SUMMER2026`, `WELCOME10`), updates order totals, and surfaces errors for expired codes (`SUMMER`). |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React Compiler)
- **UI & Styling**: React 19, Tailwind CSS v4, Base UI
- **Browser Tools**: Chrome WebMCP (`document.modelContext`)
- **Real-Time Relay**: PartyKit (Cloudflare Workers runtime)
- **Package Manager**: Bun

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed locally (`curl -fsSL https://bun.sh/install | bash`).
- Google Chrome (Canary or Stable with `#enable-experimental-web-platform-features` enabled for WebMCP testing).

### 1. Install Dependencies

```bash
bun install
```

### 2. Start the Development Servers

Run PartyKit and Next.js concurrently:

```bash
# Terminal 1: PartyKit edge relay (port 1999)
bun run dev:party

# Terminal 2: Next.js frontend (port 3000)
bun run dev
```

### 3. Test the Co-Browsing Flow

1. Open `http://localhost:3000/checkout` in your browser.
2. Click **Need Support? Request Live Help** to start a session. Note the 6-character room code.
3. In a second window (or incognito tab), open `http://localhost:3000/support`.
4. Enter the room code and connect.
5. In the support console, propose a shipping address or promo code.
6. Return to the checkout tab to observe the approval modal. Approve or decline the change.

---

## Project Structure

```
waypoint/
├── party/
│   └── index.ts                 # PartyKit relay server (ephemeral room message router)
├── src/
│   ├── app/
│   │   ├── page.tsx             # Interactive architectural demo and showcase
│   │   ├── checkout/            # Customer checkout tab (registers WebMCP tools)
│   │   └── support/             # Support rep console (tool forms, state mirror)
│   ├── hooks/
│   │   ├── use-customer-session.ts  # WebMCP tool registration and relay connection
│   │   └── use-rep-session.ts       # Support console WebSocket listener and proposer
│   └── lib/
│       ├── protocol.ts          # Strictly-typed relay event definitions
│       └── order-data.ts        # Mock order store and checkout calculation engine
├── partykit.json                # PartyKit project configuration
└── package.json
```

---

## Verification & Quality

```bash
# Type check and lint
bun run lint

# Production build
bun run build
```

---

## License

Distributed under the [MIT License](LICENSE.md). See [`LICENSE.md`](LICENSE.md) for full license text.
