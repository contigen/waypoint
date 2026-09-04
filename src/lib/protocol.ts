import type { WebMCPToolAnnotations } from '@/types/webmcp'

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type ShippingAddress = {
  name: string
  street: string
  city: string
  zip: string
}

export type OrderState = {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  promoCode: string
  discount: number
  error: string | null
  subtotal: number
  total: number
  availablePromotions?: string[]
  status?: 'pending' | 'confirmed'
  confirmationId?: string
}

export type ToolSchema = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: WebMCPToolAnnotations
}

export type SessionStateMessage = {
  type: 'session_state'
  tools: ToolSchema[]
  pageState: OrderState
}

export type RequestStateMessage = {
  type: 'request_state'
}

export type ProposeActionMessage = {
  type: 'propose_action'
  tool: string
  args: Record<string, unknown>
}

export type ActionConfirmedMessage = {
  type: 'action_confirmed'
  tool: string
  args: Record<string, unknown>
}

export type ActionResultMessage = {
  type: 'action_result'
  tool: string
  result: unknown
}

export type ActionRejectedMessage = {
  type: 'action_rejected'
  tool: string
  reason?: string
}

export type SessionEndedMessage = {
  type: 'session_ended'
  initiator: 'customer' | 'rep'
}

export type RelayMessage =
  | SessionStateMessage
  | RequestStateMessage
  | ProposeActionMessage
  | ActionConfirmedMessage
  | ActionResultMessage
  | ActionRejectedMessage
  | SessionEndedMessage
