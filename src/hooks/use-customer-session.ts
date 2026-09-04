'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { usePartySocket } from '@/hooks/use-party-socket'
import type {
  OrderState,
  ProposeActionMessage,
  RelayMessage,
  ToolSchema,
} from '@/lib/protocol'
import type { WebMCPToolDefinition } from '@/types/webmcp'
import { generateSessionCode } from '@/lib/session-code'

type PendingProposal = {
  tool: string
  args: Record<string, unknown>
  description: string
}

type UseCustomerSessionReturn = {
  sessionCode: string | null
  connected: boolean
  pendingProposal: PendingProposal | null
  sessionEndedReason: 'rep' | 'customer' | null
  startSession: () => void
  endSession: () => void
  approveProposal: () => void
  rejectProposal: () => void
}

const registeredTools = new Set<string>()

export function useCustomerSession(
  orderState: OrderState,
  onExecuteTool: (tool: string, args: Record<string, unknown>) => unknown,
): UseCustomerSessionReturn {
  const [sessionCode, setSessionCode] = useState<string | null>(null)
  const [sessionEndedReason, setSessionEndedReason] = useState<
    'rep' | 'customer' | null
  >(null)
  const [pendingProposal, setPendingProposal] =
    useState<PendingProposal | null>(null)
  const orderStateRef = useRef(orderState)
  const onExecuteToolRef = useRef(onExecuteTool)
  const sendRef = useRef<(data: string) => void>(() => {})
  const disconnectRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    orderStateRef.current = orderState
    onExecuteToolRef.current = onExecuteTool
  })

  const broadcastState = useCallback(() => {
    const tools = getToolSchemas()
    const message: RelayMessage = {
      type: 'session_state',
      tools,
      pageState: orderStateRef.current,
    }
    sendRef.current(JSON.stringify(message))
  }, [])

  const handleMessage = useCallback(
    (data: string) => {
      try {
        const message = JSON.parse(data) as RelayMessage
        if (message.type === 'propose_action') {
          const proposal = message as ProposeActionMessage
          setPendingProposal({
            tool: proposal.tool,
            args: proposal.args,
            description: formatProposalDescription(
              proposal.tool,
              proposal.args,
            ),
          })
        } else if (message.type === 'request_state') {
          broadcastState()
        } else if (message.type === 'session_ended') {
          disconnectRef.current()
          setSessionCode(null)
          setPendingProposal(null)
          setSessionEndedReason(message.initiator)
        }
      } catch {}
    },
    [broadcastState],
  )

  const { send, connected, disconnect } = usePartySocket({
    roomId: sessionCode,
    onMessage: handleMessage,
    onConnect: () => {
      broadcastState()
    },
  })

  useLayoutEffect(() => {
    sendRef.current = send
    disconnectRef.current = disconnect
  })

  useEffect(() => {
    const registerWebMcpTools = () => {
      if (typeof window === 'undefined') return
      const ctx = document.modelContext ?? navigator.modelContext
      if (!ctx || typeof ctx.registerTool !== 'function') return

      const registerSafe = (toolDef: WebMCPToolDefinition) => {
        if (registeredTools.has(toolDef.name)) return
        try {
          registeredTools.add(toolDef.name)
          const res = ctx.registerTool(toolDef)
          if (res && typeof (res as Promise<void>).catch === 'function') {
            ;(res as Promise<void>).catch(() => {})
          }
        } catch {}
      }

      registerSafe({
        name: 'get_order_details',
        description:
          'Get current order details, cart items, pricing, active promotions, and any active error state on this page',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true },
        async execute() {
          return {
            content: [{ type: 'json', json: orderStateRef.current }],
          }
        },
      })

      registerSafe({
        name: 'update_shipping_address',
        description:
          "Update the customer's shipping address on the checkout form",
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Full name of recipient' },
            street: {
              type: 'string',
              description: 'Street address including apartment or suite',
            },
            city: { type: 'string', description: 'City name' },
            zip: { type: 'string', description: 'Postal or ZIP code' },
          },
          required: ['name', 'street', 'city', 'zip'],
        },
        annotations: { readOnlyHint: false },
        async execute(args) {
          const res = onExecuteToolRef.current('update_shipping_address', args)
          return {
            content: [{ type: 'json', json: res }],
          }
        },
      })

      registerSafe({
        name: 'apply_promo_code',
        description: 'Apply a promotional discount code to the current order.',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The promo code string to apply to the order',
            },
          },
          required: ['code'],
        },
        annotations: { readOnlyHint: false },
        async execute(args) {
          const res = onExecuteToolRef.current('apply_promo_code', args)
          return {
            content: [{ type: 'json', json: res }],
          }
        },
      })
    }

    registerWebMcpTools()
  }, [])

  useEffect(() => {
    if (!connected || !sessionCode) return
    broadcastState()
    const interval = setInterval(broadcastState, 2000)
    return () => clearInterval(interval)
  }, [connected, sessionCode, broadcastState])

  useEffect(() => {
    if (connected && sessionCode) {
      broadcastState()
    }
  }, [orderState, connected, sessionCode, broadcastState])

  const startSession = useCallback(() => {
    setSessionEndedReason(null)
    setSessionCode(generateSessionCode())
  }, [])

  const endSession = useCallback(() => {
    sendRef.current(
      JSON.stringify({
        type: 'session_ended',
        initiator: 'customer',
      } satisfies RelayMessage),
    )
    disconnect()
    setSessionCode(null)
    setPendingProposal(null)
    setSessionEndedReason('customer')
  }, [disconnect])

  const approveProposal = useCallback(() => {
    if (!pendingProposal) return

    const { tool, args } = pendingProposal
    sendRef.current(
      JSON.stringify({
        type: 'action_confirmed',
        tool,
        args,
      } satisfies RelayMessage),
    )

    const result = onExecuteToolRef.current(tool, args)

    sendRef.current(
      JSON.stringify({
        type: 'action_result',
        tool,
        result,
      } satisfies RelayMessage),
    )

    setPendingProposal(null)
  }, [pendingProposal])

  const rejectProposal = useCallback(() => {
    if (!pendingProposal) return

    sendRef.current(
      JSON.stringify({
        type: 'action_rejected',
        tool: pendingProposal.tool,
        reason: 'Customer declined the action',
      } satisfies RelayMessage),
    )

    setPendingProposal(null)
  }, [pendingProposal])

  return {
    sessionCode,
    connected,
    pendingProposal,
    sessionEndedReason,
    startSession,
    endSession,
    approveProposal,
    rejectProposal,
  }
}

function getToolSchemas(): ToolSchema[] {
  return [
    {
      name: 'get_order_details',
      description:
        'Get current order details, cart items, pricing, active promotions, and any active error state on this page',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'update_shipping_address',
      description:
        "Update the customer's shipping address on the checkout form",
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name of recipient' },
          street: {
            type: 'string',
            description: 'Street address including apartment or suite',
          },
          city: { type: 'string', description: 'City name' },
          zip: { type: 'string', description: 'Postal or ZIP code' },
        },
        required: ['name', 'street', 'city', 'zip'],
      },
      annotations: { readOnlyHint: false },
    },
    {
      name: 'apply_promo_code',
      description: 'Apply a promotional discount code to the current order.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The promo code string to apply to the order',
          },
        },
        required: ['code'],
      },
      annotations: { readOnlyHint: false },
    },
  ]
}

function formatProposalDescription(
  tool: string,
  args: Record<string, unknown>,
): string {
  switch (tool) {
    case 'get_order_details':
      return 'view your current order details'
    case 'update_shipping_address': {
      const parts = [args.name, args.street, args.city, args.zip]
        .map(v => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean)
      return parts.length > 0
        ? `update your shipping address to ${parts.join(', ')}`
        : 'update your shipping address'
    }
    case 'apply_promo_code':
      return `apply promo code "${String(args.code ?? '').trim()}" to your order`
    default:
      return `run "${tool}"`
  }
}
