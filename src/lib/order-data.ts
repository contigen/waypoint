import type { OrderItem, OrderState, ShippingAddress } from '@/lib/protocol'

export const MOCK_ITEMS: OrderItem[] = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 249.99,
    quantity: 1,
  },
  { id: '2', name: 'USB-C Braided Cable (2m)', price: 19.99, quantity: 2 },
  { id: '3', name: 'Anodized Aluminum Stand', price: 79.99, quantity: 1 },
]

export const AVAILABLE_PROMOTIONS: string[] = [
  'SUMMER2026 (20% off active replacement)',
  'WELCOME10 (10% off welcome code)',
  'SAVE20 (20% off)',
  'DISCOUNT10 (10% off)',
]

const VALID_PROMOS: Record<string, number> = {
  SUMMER2026: 0.2,
  WELCOME10: 0.1,
  SAVE20: 0.2,
  DISCOUNT10: 0.1,
  SAVE10: 0.1,
  SAVE15: 0.15,
  PROMO10: 0.1,
  PROMO20: 0.2,
}

export function createInitialOrderState(): OrderState {
  const subtotal = MOCK_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  return {
    items: MOCK_ITEMS,
    shippingAddress: { name: '', street: '', city: '', zip: '' },
    promoCode: '',
    discount: 0,
    error: null,
    subtotal,
    total: subtotal,
    availablePromotions: AVAILABLE_PROMOTIONS,
  }
}

export async function getInitialOrderData(): Promise<OrderState> {
  return createInitialOrderState()
}

export function applyPromoCode(state: OrderState, code: string): OrderState {
  const clean = code.trim().toUpperCase()

  if (!clean) {
    return {
      ...state,
      error: 'Please enter a promotional discount code.',
    }
  }

  if (clean === 'SUMMER') {
    return {
      ...state,
      promoCode: clean,
      discount: 0,
      total: state.subtotal,
      error:
        'Promo code "SUMMER" has expired. Active replacement code is SUMMER2026 (20% off).',
    }
  }

  let rate = VALID_PROMOS[clean]

  if (!rate) {
    const match = clean.match(/(\d{1,2})/)
    if (match) {
      const num = Number.parseInt(match[1], 10)
      if (num >= 5 && num <= 50) {
        rate = num / 100
      }
    } else if (
      ['SAVE', 'PROMO', 'DISCOUNT', 'WELCOME', 'COUPON', 'DEAL'].some(word =>
        clean.includes(word),
      )
    ) {
      rate = 0.15
    }
  }

  if (!rate) {
    return {
      ...state,
      promoCode: clean,
      discount: 0,
      total: state.subtotal,
      error: `Promo code "${clean}" is not recognized. Valid active codes include SUMMER2026 (20% off), WELCOME10 (10% off), SAVE20, or DISCOUNT10.`,
    }
  }

  const discount = Number((state.subtotal * rate).toFixed(2))
  return {
    ...state,
    promoCode: clean,
    discount,
    total: Number((state.subtotal - discount).toFixed(2)),
    error: null,
  }
}

export function applyShippingAddress(
  state: OrderState,
  address: ShippingAddress,
): OrderState {
  return {
    ...state,
    shippingAddress: {
      name: address.name || state.shippingAddress.name,
      street: address.street || state.shippingAddress.street,
      city: address.city || state.shippingAddress.city,
      zip: address.zip || state.shippingAddress.zip,
    },
  }
}
