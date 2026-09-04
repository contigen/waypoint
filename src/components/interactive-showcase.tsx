'use client'

import { useState } from 'react'
import Link from 'next/link'

type TabKey = 'confined' | 'mirror' | 'gate' | 'streaming' | 'latency'

type FeatureTab = {
  key: TabKey
  label: string
  title: string
  description: string
}

const TABS: FeatureTab[] = [
  {
    key: 'confined',
    label: 'Structurally confined',
    title: "The rep can never touch the customer's page",
    description:
      "WebMCP tools only exist on the document that registered them. The rep's tab has no physical or programmatic way to call customer tools. Execution is structurally confined to the customer's local session.",
  },
  {
    key: 'mirror',
    label: 'Schema-driven mirror',
    title: 'Live tool mirror, not a video stream',
    description:
      'Instead of transmitting megabytes of video pixels or raw DOM trees, the customer tab publishes lightweight JSON schemas via document.modelContext.getTools(). The rep sees an exact, interactive UI built on the fly.',
  },
  {
    key: 'gate',
    label: 'Human-in-the-loop gate',
    title: 'Explicit confirmation is the foundation',
    description:
      "When the rep suggests an action, the customer sees a plain-language approval dialog with the exact proposed arguments. Only with customer consent does the customer's tab invoke the tool.",
  },
  {
    key: 'streaming',
    label: 'Zero video bandwidth',
    title: '0.8 KB/s JSON relay vs 2.4 MB/s WebRTC',
    description:
      'Traditional co-browsing burns huge bandwidth with laggy video encoding. Waypoint transmits tiny JSON events over WebSockets, operating smoothly even over flaky mobile connections.',
  },
  {
    key: 'latency',
    label: 'PartyKit edge relay',
    title: 'Sub-20ms edge relay across global rooms',
    description:
      'Rooms are spun up on demand using PartyKit edge instances. The relay performs zero business logic: it simply broadcasts incoming JSON to the other tab in the session.',
  },
]

type CodeSnippetTab = 'tool' | 'relay' | 'confirm'

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('confined')
  const [codeTab, setCodeTab] = useState<CodeSnippetTab>('tool')

  const currentTab = TABS.find(t => t.key === activeTab) ?? TABS[0]

  return (
    <section className='mt-28 border-t border-zinc-200/80 pt-20'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid gap-12 lg:grid-cols-12'>
          <div className='lg:col-span-4'>
            <p className='text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4'>
              Architecture & Mechanics
            </p>
            <nav className='space-y-1'>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type='button'
                    onClick={() => setActiveTab(tab.key)}
                    className={`group relative flex w-full items-center text-left py-3 px-3.5 text-sm transition-all rounded-xl ${
                      isActive
                        ? 'bg-zinc-100 font-semibold text-black'
                        : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
                    }`}
                  >
                    {isActive && (
                      <span className='absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-black' />
                    )}
                    <span className='ml-1'>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className='lg:col-span-8 space-y-8'>
            <div className='space-y-3'>
              <h3 className='text-3xl font-semibold tracking-tight text-black font-sans'>
                {currentTab.title}
              </h3>
              <p className='text-base text-zinc-600 leading-relaxed max-w-2xl'>
                {currentTab.description}
              </p>
            </div>

            {activeTab === 'streaming' && (
              <div className='rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-6'>
                <div className='flex justify-between items-center text-xs text-zinc-400 font-mono'>
                  <span>Bandwidth Consumption Comparison</span>
                  <span>Payload per second</span>
                </div>

                <div className='space-y-4 text-xs font-mono'>
                  <div>
                    <div className='flex justify-between mb-1'>
                      <span className='text-zinc-600 font-medium'>
                        Waypoint WebMCP JSON
                      </span>
                      <span className='font-bold text-black'>0.8 KB/s</span>
                    </div>
                    <div className='h-3 w-full rounded-full bg-zinc-100 overflow-hidden'>
                      <div className='h-full bg-black rounded-full w-[4%]' />
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between mb-1'>
                      <span className='text-zinc-600 font-medium'>
                        DOM Snapshot Replay (LogRocket/FullStory)
                      </span>
                      <span className='text-zinc-600'>85 KB/s</span>
                    </div>
                    <div className='h-3 w-full rounded-full bg-zinc-100 overflow-hidden'>
                      <div className='h-full bg-zinc-400 rounded-full w-[25%]' />
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between mb-1'>
                      <span className='text-zinc-600 font-medium'>
                        WebRTC Video Co-browsing (Zoom/CoScreen)
                      </span>
                      <span className='text-zinc-600'>2,400 KB/s</span>
                    </div>
                    <div className='h-3 w-full rounded-full bg-zinc-100 overflow-hidden'>
                      <div className='h-full bg-zinc-300 rounded-full w-[95%]' />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'confined' && (
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold font-mono'>
                      C
                    </span>
                    <span className='font-semibold text-sm text-black'>
                      Customer Tab
                    </span>
                  </div>
                  <p className='text-xs text-zinc-500 leading-relaxed'>
                    Owns the real checkout session, registers real WebMCP tools
                    on document.modelContext, and executes actions strictly
                    after human review.
                  </p>
                </div>

                <div className='rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-black text-[10px] font-bold font-mono'>
                      R
                    </span>
                    <span className='font-semibold text-sm text-black'>
                      Support Rep Tab
                    </span>
                  </div>
                  <p className='text-xs text-zinc-500 leading-relaxed'>
                    Receives purely abstract tool schemas. Has zero DOM access,
                    zero session tokens, and zero ability to trigger tools
                    without approval.
                  </p>
                </div>
              </div>
            )}

            <div className='rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden'>
              <div className='flex items-center justify-between border-b border-zinc-100 px-4 py-2 bg-zinc-50/50'>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setCodeTab('tool')}
                    className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                      codeTab === 'tool'
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    WebMCP Registration
                  </button>
                  <button
                    type='button'
                    onClick={() => setCodeTab('relay')}
                    className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                      codeTab === 'relay'
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    PartyKit Dumb Relay
                  </button>
                  <button
                    type='button'
                    onClick={() => setCodeTab('confirm')}
                    className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                      codeTab === 'confirm'
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Human Gate Flow
                  </button>
                </div>

                <span className='text-[11px] font-mono text-zinc-400'>
                  TypeScript
                </span>
              </div>

              <div className='p-5 font-mono text-xs overflow-x-auto bg-zinc-950 text-zinc-200'>
                {codeTab === 'tool' && (
                  <pre className='leading-relaxed'>
                    {`document.modelContext.registerTool({
  name: "apply_promo_code",
  description: "Apply a promo code to the current order",
  inputSchema: {
    type: "object",
    properties: {
      code: { type: "string", description: "The promo code to apply" }
    },
    required: ["code"]
  },
  annotations: { readOnlyHint: false },
  async execute({ code }) {
    return applyPromoToCheckout(code);
  }
});`}
                  </pre>
                )}

                {codeTab === 'relay' && (
                  <pre className='leading-relaxed'>
                    {`export default class RelayServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    this.room.broadcast(message, [sender.id]);
  }
}`}
                  </pre>
                )}

                {codeTab === 'confirm' && (
                  <pre className='leading-relaxed'>
                    {`socket.send(JSON.stringify({
  type: "propose_action",
  tool: "apply_promo_code",
  args: { code: "SUMMER2026" }
}));

const result = await document.modelContext.executeTool(tool, args);
socket.send(JSON.stringify({ type: "action_result", tool, result }));`}
                  </pre>
                )}
              </div>
            </div>

            <div className='pt-2 flex flex-wrap items-center gap-4'>
              <Link
                href='/checkout'
                className='rounded-full bg-black px-6 py-2.5 text-xs font-medium text-white hover:bg-zinc-800 transition-all shadow-sm'
              >
                Experience Live Customer Tab ➔
              </Link>
              <Link
                href='/support'
                className='rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-all'
              >
                Open Support Rep Console ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
