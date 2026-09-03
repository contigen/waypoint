'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type ConfirmDialogProps = {
  open: boolean
  toolName: string
  description: string
  args: Record<string, unknown>
  onApprove: () => void
  onReject: () => void
}

export function ConfirmDialog({
  open,
  toolName,
  description,
  args,
  onApprove,
  onReject,
}: ConfirmDialogProps) {
  const argEntries = Object.entries(args).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )

  return (
    <Dialog open={open} modal>
      <DialogContent className='sm:max-w-lg rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950'>
        <DialogHeader className='space-y-3 text-left'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/50 animate-pulse' />
              <span className='text-xs font-mono uppercase tracking-wider text-zinc-500'>
                Action Approval Required
              </span>
            </div>
            <span className='rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'>
              {toolName}
            </span>
          </div>

          <DialogTitle className='text-xl font-semibold tracking-tight text-black dark:text-white font-sans'>
            Support Rep Proposed an Action
          </DialogTitle>
          <p className='text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed'>
            The support agent cannot touch your page directly. Approve below to
            run this action locally on your document.
          </p>
        </DialogHeader>

        <div className='my-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 space-y-3'>
          <div className='flex items-start gap-2.5'>
            <div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 12h14' />
                <path d='m12 5 7 7-7 7' />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='text-xs font-semibold uppercase tracking-wider text-zinc-400'>
                Action proposal
              </p>
              <p className='text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize'>
                {description}
              </p>
            </div>
          </div>

          {argEntries.length > 0 && (
            <div className='rounded-xl border border-zinc-200/60 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 space-y-2'>
              <p className='text-[11px] font-mono uppercase tracking-wider text-zinc-400'>
                Parameters
              </p>
              <div className='space-y-1.5'>
                {argEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className='flex items-center justify-between text-xs font-mono'
                  >
                    <span className='text-zinc-500'>{key}:</span>
                    <span className='font-semibold text-black dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md'>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400'>
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='shrink-0 text-emerald-600'
          >
            <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
          </svg>
          <span>
            WebMCP boundary: Real execution is structurally confined to this
            browser tab.
          </span>
        </div>

        <DialogFooter className='mt-4 flex sm:flex-row gap-2.5'>
          <button
            type='button'
            onClick={onReject}
            className='flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 active:scale-95 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900'
          >
            Decline Action
          </button>
          <button
            type='button'
            onClick={onApprove}
            className='flex-1 rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
          >
            Approve & Execute Locally
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
