'use client'

import { useState } from 'react'
import type { ShippingAddress, ToolSchema } from '@/lib/protocol'

type ToolFormProps = {
  tool: ToolSchema
  onPropose: (tool: string, args: Record<string, unknown>) => void
  currentShippingAddress?: ShippingAddress
}

type SchemaProperties = Record<string, { type: string; description?: string }>

export function ToolForm({
  tool,
  onPropose,
  currentShippingAddress,
}: ToolFormProps) {
  const properties = (tool.inputSchema.properties ?? {}) as SchemaProperties
  const fields = Object.entries(properties)
  const rawRequired = Array.isArray(tool.inputSchema.required)
    ? (tool.inputSchema.required as string[])
    : []
  const requiredFields = new Set<string>(rawRequired)
  const isReadOnly = tool.annotations?.readOnlyHint === true

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(([key]) => [key, ''])),
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const cleanValues: Record<string, string> = {}
    for (const [key] of fields) {
      cleanValues[key] = (values[key] ?? '').trim()
    }
    onPropose(tool.name, cleanValues)
  }

  const copyCurrentAddress = () => {
    if (!currentShippingAddress) return
    setValues({
      name: currentShippingAddress.name || '',
      street: currentShippingAddress.street || '',
      city: currentShippingAddress.city || '',
      zip: currentShippingAddress.zip || '',
    })
  }

  if (isReadOnly) {
    return (
      <div className='rounded-2xl border border-zinc-200/90 bg-white shadow-sm overflow-hidden transition-all hover:border-zinc-300'>
        <div className='flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 bg-zinc-50/80'>
          <div className='flex items-center gap-2'>
            <span className='rounded-full bg-black text-white px-3 py-0.5 text-xs font-mono font-medium'>
              {tool.name}
            </span>
            <span className='rounded-full bg-zinc-200/70 border border-zinc-300/50 px-2 py-0.5 text-[10px] font-mono text-zinc-700'>
              readOnlyHint
            </span>
          </div>
          <span className='flex items-center gap-1.5 text-[11px] font-mono text-emerald-600'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
            Live Ingestion Active
          </span>
        </div>

        <div className='p-5 font-mono text-xs bg-zinc-950 text-zinc-200 space-y-3'>
          <p className='text-xs text-zinc-300 leading-relaxed font-sans'>
            {tool.description}
          </p>

          <div className='pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400'>
            <span className='flex items-center gap-1.5 text-emerald-400'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
              Live Ingestion Active
            </span>
            <span>Mirrored to Column 1</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition-all hover:border-zinc-300'>
      <div className='flex items-center justify-between pb-3 border-b border-zinc-100'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs font-semibold text-black'>
            {tool.name}
          </span>
        </div>
        <span className='rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-mono text-amber-800'>
          requires customer gate
        </span>
      </div>

      <p className='mt-2.5 text-xs text-zinc-500 leading-relaxed'>
        {tool.description}
      </p>

      {tool.name === 'update_shipping_address' &&
        currentShippingAddress?.name && (
          <div className='mt-3 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-[11px] text-zinc-600 flex justify-between items-center'>
            <span className='truncate'>
              Customer current:{' '}
              <span className='font-medium text-zinc-800'>
                {currentShippingAddress.name}
              </span>
              , {currentShippingAddress.city}
            </span>
            <button
              type='button'
              onClick={copyCurrentAddress}
              className='ml-2 shrink-0 font-mono text-[10px] font-medium text-black hover:underline'
            >
              Copy to form
            </button>
          </div>
        )}

      {tool.name === 'apply_promo_code' && (
        <div className='mt-3 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-[11px] text-zinc-600 flex justify-between items-center'>
          <span className='truncate'>
            Active internal code:{' '}
            <span className='font-mono font-medium text-zinc-800'>
              SUMMER2026
            </span>{' '}
            (20% off)
          </span>
          <button
            type='button'
            onClick={() => setValues(prev => ({ ...prev, code: 'SUMMER2026' }))}
            className='ml-2 shrink-0 font-mono text-[10px] font-medium text-black hover:underline'
          >
            Insert code
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
        {fields.length > 0 && (
          <div className='text-[10px] font-mono uppercase tracking-wider text-zinc-400'>
            Proposed Arguments
          </div>
        )}
        {fields.map(([key, schema]) => (
          <div key={key}>
            <div className='flex justify-between items-center mb-1'>
              <label
                htmlFor={`${tool.name}-${key}`}
                className='text-[11px] font-mono uppercase tracking-wider text-zinc-500'
              >
                {key}
                {requiredFields.has(key) && (
                  <span className='text-red-500 ml-0.5'>*</span>
                )}
              </label>
              {schema.description && (
                <span className='text-[10px] text-zinc-400'>
                  {schema.description}
                </span>
              )}
            </div>
            <input
              id={`${tool.name}-${key}`}
              type='text'
              required={requiredFields.has(key)}
              placeholder={`Enter ${key}`}
              value={values[key] ?? ''}
              onChange={e =>
                setValues(prev => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              className='w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none font-mono'
            />
          </div>
        ))}

        <button
          type='submit'
          className='mt-2 w-full rounded-full bg-black py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-all active:scale-98 shadow-sm'
        >
          Propose Action ➔
        </button>
      </form>
    </div>
  )
}
