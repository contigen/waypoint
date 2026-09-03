'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NavigationBar } from '@/components/navigation-bar'
import { useRepSession } from '@/hooks/use-rep-session'
import { ToolForm } from './tool-form'

type SupportClientProps = {
  serverConfig?: {
    relayHost: string
    defaultTools: string[]
  }
}

export function SupportClient({ serverConfig }: SupportClientProps) {
  const {
    roomId,
    connected,
    tools,
    pageState,
    activity,
    join,
    leave,
    proposeAction,
  } = useRepSession()

  const [codeInput, setCodeInput] = useState('')

  if (!roomId) {
    return (
      <div className='min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white'>
        <NavigationBar activeSection='support' />

        <main className='mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col items-center justify-center px-4 py-16'>
          <div className='w-full max-w-md space-y-6 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-md'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M15 10l-4 4l6 6l4-16l-18 7l4 2l2 6l3-4' />
              </svg>
            </div>

            <div>
              <span className='rounded-full bg-zinc-100 px-3 py-1 font-mono text-xs font-medium text-zinc-600'>
                Support Rep Console
              </span>
              <h1 className='mt-3 text-3xl font-semibold tracking-tight text-black'>
                Join Co-browsing Session
              </h1>
              <p className='mt-2 text-sm text-zinc-500 leading-relaxed'>
                Enter the 6-character session key from the customer tab.
                Waypoint will stream their WebMCP tool schemas.
              </p>
            </div>

            <div className='rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4'>
              <div>
                <label
                  htmlFor='session-code-input'
                  className='block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2'
                >
                  Room Session Code
                </label>
                <input
                  id='session-code-input'
                  type='text'
                  placeholder='e.g. 7K2M9P'
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && codeInput.trim()) join(codeInput)
                  }}
                  className='w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.35em] text-black uppercase placeholder:text-zinc-300 focus:border-black focus:outline-none transition-colors'
                  maxLength={8}
                />
              </div>

              <button
                type='button'
                onClick={() => join(codeInput)}
                disabled={!codeInput.trim()}
                className='w-full rounded-full bg-black py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:opacity-40 transition-all shadow-sm'
              >
                Connect to Customer Session ➔
              </button>
            </div>

            <div className='rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-left text-xs text-zinc-500 space-y-2'>
              <div className='font-semibold text-zinc-800'>
                How support co-browsing works:
              </div>
              <ol className='list-decimal list-inside space-y-1 text-zinc-600'>
                <li>
                  Open the{' '}
                  <Link
                    href='/checkout'
                    target='_blank'
                    className='underline text-black font-medium'
                  >
                    Customer Checkout
                  </Link>{' '}
                  tab and click &quot;Need Support&quot;.
                </li>
                <li>Copy the generated 6-character room code.</li>
                <li>
                  Paste it above to mirror their tools and propose safe actions.
                </li>
              </ol>
            </div>

            {serverConfig && (
              <p className='text-[11px] font-mono text-zinc-400'>
                Relay host: {serverConfig.relayHost}
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white'>
      <NavigationBar activeSection='support' />

      <div className='sticky top-14 z-30 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur-md px-4 py-2.5'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='flex items-center gap-2 rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm'>
              <span className='relative flex h-2 w-2'>
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connected ? 'animate-ping bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    connected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span>
                {connected ? 'Live Customer Session' : 'Connecting...'}
              </span>
            </span>

            <div className='flex items-center gap-2 text-xs'>
              <span className='text-zinc-500'>Room:</span>
              <span className='rounded-full bg-black px-3 py-0.5 font-mono text-xs font-bold tracking-widest text-white'>
                {roomId}
              </span>
            </div>

            <span className='hidden sm:inline-flex rounded-full bg-zinc-200/70 px-2.5 py-0.5 text-[11px] font-mono text-zinc-700'>
              {tools.length} WebMCP tools discovered
            </span>
          </div>

          <button
            type='button'
            onClick={leave}
            className='rounded-full border border-zinc-300 bg-white px-3.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors'
          >
            Disconnect Session
          </button>
        </div>
      </div>

      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid gap-8 lg:grid-cols-12'>
          <div className='space-y-6 lg:col-span-4'>
            <div className='flex items-center justify-between pb-2 border-b border-zinc-100'>
              <h2 className='text-xs font-mono uppercase tracking-wider text-zinc-500'>
                1. Customer Live State
              </h2>
              <span className='text-[11px] font-mono text-emerald-600'>
                {pageState ? 'synchronized' : 'waiting...'}
              </span>
            </div>

            {pageState ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-3 rounded-2xl border border-zinc-200/90 bg-white p-3 text-center shadow-sm'>
                  <div className='border-r border-zinc-100 px-2'>
                    <p className='text-[10px] uppercase font-mono tracking-wider text-zinc-400'>
                      Items
                    </p>
                    <p className='mt-1 text-lg font-bold font-mono text-black'>
                      {pageState.items.length}
                    </p>
                  </div>
                  <div className='border-r border-zinc-100 px-2'>
                    <p className='text-[10px] uppercase font-mono tracking-wider text-zinc-400'>
                      Discount
                    </p>
                    <p className='mt-1 text-lg font-bold font-mono text-emerald-600'>
                      ${pageState.discount.toFixed(2)}
                    </p>
                  </div>
                  <div className='px-2'>
                    <p className='text-[10px] uppercase font-mono tracking-wider text-zinc-400'>
                      Total
                    </p>
                    <p className='mt-1 text-lg font-bold font-mono text-black'>
                      ${pageState.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {pageState.status === 'confirmed' && (
                  <div className='rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-900 space-y-1'>
                    <div className='flex items-center gap-1.5 font-semibold'>
                      <span className='flex h-2 w-2 rounded-full bg-emerald-600' />
                      <span>Order Confirmed & Paid</span>
                    </div>
                    <p className='font-mono text-[11px] text-emerald-800'>
                      ID: {pageState.confirmationId}
                    </p>
                  </div>
                )}

                {pageState.error && (
                  <div className='rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 space-y-1'>
                    <div className='flex items-center gap-1.5 font-semibold'>
                      <svg
                        width='13'
                        height='13'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <line x1='12' y1='8' x2='12' y2='12' />
                        <line x1='12' y1='16' x2='12.01' y2='16' />
                      </svg>
                      <span>Active Customer Error</span>
                    </div>
                    <p className='text-[11px] leading-relaxed'>
                      {pageState.error}
                    </p>
                  </div>
                )}

                <div className='rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm space-y-3'>
                  <p className='text-[11px] font-mono uppercase tracking-wider text-zinc-400'>
                    Shipping Recipient
                  </p>
                  {pageState.shippingAddress.name ? (
                    <div className='text-xs space-y-0.5 text-zinc-800 font-mono'>
                      <p className='font-semibold'>
                        {pageState.shippingAddress.name}
                      </p>
                      <p className='text-zinc-600'>
                        {pageState.shippingAddress.street}
                      </p>
                      <p className='text-zinc-600'>
                        {pageState.shippingAddress.city},{' '}
                        {pageState.shippingAddress.zip}
                      </p>
                    </div>
                  ) : (
                    <p className='text-xs italic text-zinc-400 font-mono'>
                      Not yet filled by customer
                    </p>
                  )}
                </div>

                <div className='rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm space-y-2'>
                  <p className='text-[11px] font-mono uppercase tracking-wider text-zinc-400'>
                    Cart Items
                  </p>
                  <div className='divide-y divide-zinc-100 text-xs'>
                    {pageState.items.map(item => (
                      <div
                        key={item.id}
                        className='py-2 flex justify-between items-center'
                      >
                        <span className='text-zinc-700'>
                          {item.name}{' '}
                          <span className='text-zinc-400 font-mono'>
                            ×{item.quantity}
                          </span>
                        </span>
                        <span className='font-mono font-medium text-black'>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 space-y-2'>
                <span className='inline-block h-6 w-6 rounded-full border-2 border-zinc-300 border-t-black animate-spin' />
                <p>Waiting for customer to broadcast page state...</p>
              </div>
            )}
          </div>

          <div className='space-y-6 lg:col-span-4'>
            <div className='flex items-center justify-between pb-2 border-b border-zinc-100'>
              <h2 className='text-xs font-mono uppercase tracking-wider text-zinc-500'>
                2. Discovered WebMCP Tools
              </h2>
              <span className='text-[11px] font-mono text-zinc-400'>
                {tools.length} available
              </span>
            </div>

            {tools.length > 0 ? (
              <div className='space-y-4'>
                {tools.map(tool => (
                  <ToolForm
                    key={tool.name}
                    tool={tool}
                    onPropose={proposeAction}
                    currentShippingAddress={pageState?.shippingAddress}
                  />
                ))}
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400'>
                <p>No tools received yet.</p>
                <p className='mt-1 text-[11px] text-zinc-400'>
                  Ensure the customer tab is open with the same code.
                </p>
              </div>
            )}
          </div>

          <div className='space-y-6 lg:col-span-4'>
            <div className='flex items-center justify-between pb-2 border-b border-zinc-100'>
              <h2 className='text-xs font-mono uppercase tracking-wider text-zinc-500'>
                3. Live Protocol Stream
              </h2>
              <span className='text-[11px] font-mono text-zinc-400'>
                {activity.length} events
              </span>
            </div>

            <div className='rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden'>
              <div className='max-h-[calc(100vh-14rem)] overflow-y-auto divide-y divide-zinc-100 p-2'>
                {activity.length > 0 ? (
                  activity.map(event => (
                    <div key={event.id} className='p-3 text-xs space-y-1'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                            event.kind === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : event.kind === 'proposed'
                                ? 'bg-blue-100 text-blue-800'
                                : event.kind === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : event.kind === 'result'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {event.kind}
                        </span>
                        <span className='font-mono text-[10px] text-zinc-400'>
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className='text-zinc-700 font-mono text-[11px] break-all leading-relaxed'>
                        {event.detail}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className='p-6 text-center text-xs text-zinc-400'>
                    No protocol messages received yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
