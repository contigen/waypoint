'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { NavigationBar } from '@/components/navigation-bar'
import { useCustomerSession } from '@/hooks/use-customer-session'
import { applyPromoCode, applyShippingAddress } from '@/lib/order-data'
import type { OrderState } from '@/lib/protocol'
import { ConfirmDialog } from './confirm-dialog'

type CheckoutClientProps = {
  initialOrderState: OrderState
}

export function CheckoutClient({ initialOrderState }: CheckoutClientProps) {
  const [orderState, setOrderState] = useState<OrderState>(initialOrderState)
  const [copied, setCopied] = useState(false)
  const orderStateRef = useRef<OrderState>(initialOrderState)

  useLayoutEffect(() => {
    orderStateRef.current = orderState
  })

  const handleExecuteTool = useCallback(
    (tool: string, args: Record<string, unknown>): unknown => {
      const prev = orderStateRef.current
      switch (tool) {
        case 'get_order_details': {
          return prev
        }
        case 'update_shipping_address': {
          const name = String(args.name ?? args.fullName ?? '').trim()
          const street = String(
            args.street ?? args.streetAddress ?? args.address ?? '',
          ).trim()
          const city = String(args.city ?? '').trim()
          const zip = String(
            args.zip ?? args.postalCode ?? args.zipCode ?? '',
          ).trim()

          if (!name || !street || !city || !zip) {
            return {
              success: false,
              error:
                'Missing required shipping address fields (name, street, city, zip).',
            }
          }

          const updated = applyShippingAddress(prev, {
            name,
            street,
            city,
            zip,
          })
          orderStateRef.current = updated
          setOrderState(updated)
          return { success: true, address: updated.shippingAddress }
        }
        case 'apply_promo_code': {
          const rawCode = String(
            args.code ?? args.promoCode ?? args.coupon ?? '',
          ).trim()
          if (!rawCode) {
            return { success: false, error: 'Promo code is required.' }
          }
          const withPromo = applyPromoCode(prev, rawCode)
          orderStateRef.current = withPromo
          setOrderState(withPromo)
          return withPromo.error
            ? { success: false, error: withPromo.error }
            : {
                success: true,
                discount: withPromo.discount,
                total: withPromo.total,
              }
        }
        default:
          return { error: `Unknown tool: ${tool}` }
      }
    },
    [],
  )

  const {
    sessionCode,
    connected,
    pendingProposal,
    sessionEndedReason,
    startSession,
    endSession,
    approveProposal,
    rejectProposal,
  } = useCustomerSession(orderState, handleExecuteTool)

  const handleAddressChange = (
    field: keyof OrderState['shippingAddress'],
    value: string,
  ) => {
    setOrderState(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value },
    }))
  }

  const handleApplyPromo = () => {
    setOrderState(prev => applyPromoCode(prev, prev.promoCode))
  }

  const handleConfirmOrder = () => {
    if (
      !orderState.shippingAddress.name.trim() ||
      !orderState.shippingAddress.street.trim() ||
      !orderState.shippingAddress.city.trim() ||
      !orderState.shippingAddress.zip.trim()
    ) {
      setOrderState(prev => ({
        ...prev,
        error:
          'Please complete your shipping address before placing your order.',
      }))
      return
    }

    const confirmationId = `ORD-CONFIRMED-${Math.floor(100000 + Math.random() * 900000)}`
    const confirmed: OrderState = {
      ...orderState,
      status: 'confirmed',
      confirmationId,
      error: null,
    }
    orderStateRef.current = confirmed
    setOrderState(confirmed)
  }

  const copyCode = () => {
    if (!sessionCode) return
    navigator.clipboard.writeText(sessionCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white'>
      <NavigationBar activeSection='checkout' />

      {sessionCode && (
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
                {connected ? 'Live Relay Connected' : 'Connecting to Relay...'}
              </span>

              <div className='flex items-center gap-2 text-xs text-zinc-500'>
                <span>Room Code:</span>
                <button
                  type='button'
                  onClick={copyCode}
                  className='flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-0.5 font-mono text-xs font-bold tracking-widest text-black hover:border-black transition-colors'
                >
                  <span>{sessionCode}</span>
                  <svg
                    width='12'
                    height='12'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
                    <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
                  </svg>
                </button>
                {copied && (
                  <span className='text-emerald-600 font-medium'>Copied!</span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Link
                href='/support'
                target='_blank'
                className='hidden sm:inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-black underline underline-offset-4'
              >
                Open Rep Tab ↗
              </Link>
              <button
                type='button'
                onClick={endSession}
                className='rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors'
              >
                End Help Session
              </button>
            </div>
          </div>
        </div>
      )}

      {!sessionCode && sessionEndedReason === 'rep' && (
        <div className='border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-700'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full bg-zinc-400' />
              <span>
                Live support session was concluded by the support
                representative.
              </span>
            </div>
            <button
              type='button'
              onClick={startSession}
              className='rounded-full bg-black px-3.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors'
            >
              Reopen Session
            </button>
          </div>
        </div>
      )}

      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10'>
        <div className='mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-100 pb-6'>
          <div>
            <div className='flex items-center gap-2 text-xs text-zinc-500 mb-1'>
              <span>Store</span>
              <span>/</span>
              <span>Checkout</span>
              <span>/</span>
              <span className='font-mono text-zinc-800'>#ORD-9428</span>
            </div>
            <h1 className='text-3xl font-semibold tracking-tight text-black'>
              Review & Pay
            </h1>
            <p className='text-sm text-zinc-500 mt-1'>
              Complete your shipping address and apply coupon codes before
              placing order.
            </p>
          </div>

          {!sessionCode ? (
            <button
              type='button'
              onClick={startSession}
              className='inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 transition-all shadow-sm'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-zinc-600'
              >
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
              </svg>
              <span>Need Support? Request Live Help</span>
            </button>
          ) : (
            <div className='flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1.5 font-medium'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
              <span>Support Rep can propose actions to your page</span>
            </div>
          )}
        </div>

        <div className='grid gap-10 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-7'>
            <section className='rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between pb-4 border-b border-zinc-100'>
                <h2 className='text-base font-semibold text-black'>
                  1. Shipping Information
                </h2>
                <span className='text-xs font-mono text-zinc-400'>
                  schema: update_shipping_address
                </span>
              </div>

              <div className='mt-5 space-y-4'>
                <div>
                  <label
                    htmlFor='shipping-name'
                    className='block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5'
                  >
                    Full Name
                  </label>
                  <input
                    id='shipping-name'
                    type='text'
                    placeholder='e.g. Alex Morgan'
                    value={orderState.shippingAddress.name}
                    onChange={e => handleAddressChange('name', e.target.value)}
                    className='w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors'
                  />
                </div>

                <div>
                  <label
                    htmlFor='shipping-street'
                    className='block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5'
                  >
                    Street Address
                  </label>
                  <input
                    id='shipping-street'
                    type='text'
                    placeholder='e.g. 742 Evergreen Terrace'
                    value={orderState.shippingAddress.street}
                    onChange={e =>
                      handleAddressChange('street', e.target.value)
                    }
                    className='w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='shipping-city'
                      className='block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5'
                    >
                      City
                    </label>
                    <input
                      id='shipping-city'
                      type='text'
                      placeholder='Springfield'
                      value={orderState.shippingAddress.city}
                      onChange={e =>
                        handleAddressChange('city', e.target.value)
                      }
                      className='w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='shipping-zip'
                      className='block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5'
                    >
                      Postal / ZIP
                    </label>
                    <input
                      id='shipping-zip'
                      type='text'
                      placeholder='97477'
                      value={orderState.shippingAddress.zip}
                      onChange={e => handleAddressChange('zip', e.target.value)}
                      onBlur={() =>
                        setOrderState(prev =>
                          applyShippingAddress(prev, prev.shippingAddress),
                        )
                      }
                      className='w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors'
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className='rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between pb-4 border-b border-zinc-100'>
                <h2 className='text-base font-semibold text-black'>
                  2. Promotional Code
                </h2>
                <span className='text-xs font-mono text-zinc-400'>
                  schema: apply_promo_code
                </span>
              </div>

              <div className='mt-5'>
                <div className='flex gap-2.5'>
                  <input
                    type='text'
                    placeholder="Enter promo code (e.g. SUMMER)"
                    value={orderState.promoCode}
                    onChange={e =>
                      setOrderState(prev => ({
                        ...prev,
                        promoCode: e.target.value,
                      }))
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleApplyPromo()
                    }}
                    className='flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none font-mono transition-colors'
                  />
                  <button
                    type='button'
                    onClick={handleApplyPromo}
                    className='rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white hover:bg-black transition-colors'
                  >
                    Apply
                  </button>
                </div>

                {orderState.error && (
                  <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800 space-y-2'>
                    <div className='flex items-center gap-2 font-semibold'>
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <line x1='12' y1='8' x2='12' y2='12' />
                        <line x1='12' y1='16' x2='12.01' y2='16' />
                      </svg>
                      <span>Checkout Error State</span>
                    </div>
                    <p className='leading-relaxed'>{orderState.error}</p>
                    {!sessionCode && (
                      <button
                        type='button'
                        onClick={startSession}
                        className='mt-1 inline-flex items-center gap-1 font-semibold text-rose-900 underline underline-offset-2'
                      >
                        Connect with support to resolve this code ➔
                      </button>
                    )}
                  </div>
                )}

                {orderState.discount > 0 && !orderState.error && (
                  <div className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-emerald-600'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                      <span>
                        Promo code applied! Saved $
                        {orderState.discount.toFixed(2)}.
                      </span>
                    </div>
                    <span className='font-mono font-semibold bg-emerald-100 px-2 py-0.5 rounded text-[11px]'>
                      {orderState.promoCode}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className='space-y-6 lg:col-span-5'>
            <div className='rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sticky top-28'>
              <h2 className='text-base font-semibold text-black pb-4 border-b border-zinc-100'>
                Order Summary
              </h2>

              <div className='mt-4 divide-y divide-zinc-100'>
                {orderState.items.map(item => (
                  <div
                    key={item.id}
                    className='py-3 flex justify-between gap-4 text-sm'
                  >
                    <div>
                      <p className='font-medium text-zinc-900'>{item.name}</p>
                      <p className='text-xs text-zinc-500 mt-0.5'>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className='font-mono text-sm font-semibold tabular-nums text-zinc-900'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className='mt-4 border-t border-zinc-100 pt-4 space-y-2 text-xs'>
                <div className='flex justify-between text-zinc-600'>
                  <span>Subtotal</span>
                  <span className='font-mono text-zinc-900 tabular-nums'>
                    ${orderState.subtotal.toFixed(2)}
                  </span>
                </div>

                {orderState.discount > 0 && (
                  <div className='flex justify-between text-emerald-700 font-medium'>
                    <span>Promotional Discount</span>
                    <span className='font-mono tabular-nums'>
                      −${orderState.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className='flex justify-between text-zinc-600'>
                  <span>Shipping & Delivery</span>
                  <span className='font-mono text-zinc-900'>Complimentary</span>
                </div>

                <div className='border-t border-zinc-200 pt-3 flex justify-between items-baseline'>
                  <span className='text-sm font-semibold text-black'>
                    Total Due
                  </span>
                  <span className='font-mono text-xl font-bold text-black tabular-nums'>
                    ${orderState.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {orderState.status === 'confirmed' ? (
                <div className='mt-6 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 space-y-2 shadow-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold'>
                      ✓
                    </span>
                    <span className='font-semibold text-sm text-emerald-900 font-sans'>
                      Order Placed & Paid Successfully
                    </span>
                  </div>
                  <p className='font-mono text-xs text-emerald-800'>
                    Confirmation: {orderState.confirmationId}
                  </p>
                  <p className='text-xs text-emerald-700 leading-relaxed'>
                    Thank you! Shipping to {orderState.shippingAddress.name} at{' '}
                    {orderState.shippingAddress.street},{' '}
                    {orderState.shippingAddress.city}{' '}
                    {orderState.shippingAddress.zip}.
                  </p>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={handleConfirmOrder}
                  className='mt-6 w-full rounded-full bg-black py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-all shadow-md active:scale-98'
                >
                  Confirm & Pay Order
                </button>
              )}

              <div className='mt-6 rounded-xl border border-zinc-200/80 bg-zinc-50 p-4'>
                <div className='flex items-center justify-between text-xs font-semibold text-zinc-800 mb-1'>
                  <span>Waypoint Security Architecture</span>
                  <span className='rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-mono'>
                    Zero-Trust
                  </span>
                </div>
                <p className='text-[11px] text-zinc-500 leading-relaxed'>
                  Support reps propose actions via structured schemas. Your
                  browser confirms each operation before local tool execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {pendingProposal && (
        <ConfirmDialog
          open={Boolean(pendingProposal)}
          toolName={pendingProposal.tool}
          description={pendingProposal.description}
          args={pendingProposal.args}
          onApprove={approveProposal}
          onReject={rejectProposal}
        />
      )}
    </div>
  )
}
