import { SupportClient } from './support-client'

type SupportInitialData = {
  relayHost: string
  defaultTools: string[]
}

async function getSupportServerConfig(): Promise<SupportInitialData> {
  return {
    relayHost: process.env.NEXT_PUBLIC_PARTY_HOST ?? 'localhost:1999',
    defaultTools: [
      'get_order_details',
      'update_shipping_address',
      'apply_promo_code',
    ],
  }
}

export default async function SupportPage() {
  const config = await getSupportServerConfig()

  return <SupportClient serverConfig={config} />
}
