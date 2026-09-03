import { getInitialOrderData } from '@/lib/order-data'
import { CheckoutClient } from './checkout-client'

export default async function CheckoutPage() {
  const initialOrderState = await getInitialOrderData()

  return <CheckoutClient initialOrderState={initialOrderState} />
}
