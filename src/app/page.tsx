import Link from 'next/link'
import { NavigationBar } from '@/components/navigation-bar'
import { InteractiveShowcase } from '@/components/interactive-showcase'

type ToolShowcase = {
  name: string
  description: string
  tags: string[]
  requiresApproval: boolean
  argsCount: number
}

const DEMO_TOOLS: ToolShowcase[] = [
  {
    name: 'get_order_details',
    description:
      'Inspect current cart items, shipping address, subtotal, discount, and any active error state on this document.',
    tags: ['readOnly', 'query', 'state'],
    requiresApproval: false,
    argsCount: 0,
  },
  {
    name: 'update_shipping_address',
    description:
      "Propose updating the customer's shipping address fields. Executes strictly after plain-language customer confirmation.",
    tags: ['mutating', 'form', 'checkout'],
    requiresApproval: true,
    argsCount: 4,
  },
  {
    name: 'apply_promo_code',
    description:
      'Propose applying a discount code (e.g. SUMMER2026). Can be used by the rep to fix an expired promo code error live.',
    tags: ['mutating', 'discounts', 'fix-error'],
    requiresApproval: true,
    argsCount: 1,
  },
]

export default function Home() {
  return (
    <div className='min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white'>
      <NavigationBar activeSection='overview' />

      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24'>
        <div className='grid gap-12 lg:grid-cols-12 lg:items-center'>
          <div className='lg:col-span-6 space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-1 text-xs text-zinc-600 font-mono'>
              <span className='h-1.5 w-1.5 rounded-full bg-black' />
              <span>Live Support Co-Browsing via WebMCP</span>
            </div>

            <h1 className='text-5xl sm:text-6xl font-semibold tracking-tight text-black leading-[1.08] font-sans'>
              Real tools.
              <br />
              Zero screen share.
            </h1>

            <p className='text-lg text-zinc-600 leading-relaxed max-w-xl'>
              When a customer gets stuck on checkout, a support rep sees a live
              structured mirror of what the page actually offers — built from
              WebMCP schemas, not a video feed.
            </p>

            <div className='flex flex-wrap items-center gap-3 pt-2'>
              <Link
                href='/checkout'
                className='rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-all shadow-md active:scale-95'
              >
                1. Open Customer Checkout
              </Link>
              <Link
                href='/support'
                className='rounded-full border border-zinc-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 transition-all active:scale-95'
              >
                2. Open Support Console ➔
              </Link>
            </div>

            <p className='text-xs text-zinc-400 font-mono'>
              PartyKit relay: zero business logic · Chrome 150+
              document.modelContext
            </p>
          </div>

          <div className='lg:col-span-6'>
            <div className='rounded-3xl border border-zinc-200/90 bg-zinc-50/60 p-4 shadow-xl'>
              <div className='rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-sm'>
                <div className='flex items-center justify-between pb-3 border-b border-zinc-100 text-xs'>
                  <div className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='font-mono font-medium text-zinc-800'>
                      waypoint-session: active
                    </span>
                  </div>
                  <span className='font-mono text-zinc-400 text-[11px]'>
                    partykit: room-w9p2
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-3 text-xs'>
                  <div className='rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 space-y-1.5'>
                    <div className='flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase'>
                      <span>Customer Page</span>
                      <span className='text-emerald-600'>Local Tab</span>
                    </div>
                    <p className='font-medium text-zinc-900'>
                      Cart Error: Promo Expired
                    </p>
                    <p className='text-zinc-500 text-[11px]'>
                      Registers WebMCP tools locally on document.modelContext.
                    </p>
                  </div>

                  <div className='rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 space-y-1.5'>
                    <div className='flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase'>
                      <span>Support Rep</span>
                      <span className='text-blue-600'>Mirror Tab</span>
                    </div>
                    <p className='font-medium text-zinc-900'>
                      Proposes SUMMER2026
                    </p>
                    <p className='text-zinc-500 text-[11px]'>
                      Receives JSON schemas. Proposes fix via PartyKit relay.
                    </p>
                  </div>
                </div>

                <div className='rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 space-y-1'>
                  <div className='flex items-center gap-1.5 font-semibold'>
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                    >
                      <circle cx='12' cy='12' r='10' />
                      <line x1='12' y1='8' x2='12' y2='12' />
                      <line x1='12' y1='16' x2='12.01' y2='16' />
                    </svg>
                    <span>The Human Gate (Customer Consent Required)</span>
                  </div>
                  <p className='text-[11px] leading-relaxed text-amber-800'>
                    The rep cannot click or submit for the customer. Only after
                    the customer clicks &quot;Approve&quot; does the local
                    document execute the tool.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className='mt-24 border-t border-zinc-200/80 pt-16'>
          <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8'>
            <div>
              <p className='text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1'>
                Schema Directory
              </p>
              <h2 className='text-2xl font-semibold tracking-tight text-black'>
                WebMCP Tools Registered on Document
              </h2>
            </div>
            <p className='text-xs text-zinc-500 max-w-sm'>
              Discovered dynamically by getTools() and broadcasted as JSON
              schemas across PartyKit rooms.
            </p>
          </div>

          <div className='divide-y divide-zinc-200 border-t border-b border-zinc-200'>
            {DEMO_TOOLS.map(tool => (
              <div
                key={tool.name}
                className='py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-zinc-50/60 px-3 rounded-xl'
              >
                <div className='space-y-2 max-w-2xl'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-mono text-base font-semibold text-black'>
                      {tool.name}
                    </h3>
                    <div className='flex items-center gap-1.5'>
                      {tool.tags.map(tag => (
                        <span
                          key={tag}
                          className='rounded-full bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 text-[10px] font-mono text-zinc-600'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className='text-xs text-zinc-600 leading-relaxed'>
                    {tool.description}
                  </p>
                </div>

                <div className='flex items-center gap-4 shrink-0'>
                  <div className='text-right text-xs font-mono text-zinc-500'>
                    <p>{tool.argsCount} arguments</p>
                    <p
                      className={
                        tool.requiresApproval
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }
                    >
                      {tool.requiresApproval
                        ? 'Gate: Required'
                        : 'Gate: Read-only'}
                    </p>
                  </div>
                  <Link
                    href='/checkout'
                    className='rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-800 hover:border-black transition-colors'
                  >
                    Test on Checkout
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <InteractiveShowcase />
      </main>

      <footer className='border-t border-zinc-200 py-10 text-center text-xs text-zinc-500 font-mono'>
        <div className='mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p>
            © 2026 Waypoint · Live Support Co-browsing via WebMCP & PartyKit
          </p>
          <div className='flex items-center gap-6'>
            <Link href='/checkout' className='hover:text-black'>
              Customer Tab
            </Link>
            <Link href='/support' className='hover:text-black'>
              Support Tab
            </Link>
            <a
              href='https://github.com/contigen/waypoint/blob/main/LICENSE.md'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-black'
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
