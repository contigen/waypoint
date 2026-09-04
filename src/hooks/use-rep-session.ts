'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { usePartySocket } from '@/hooks/use-party-socket'
import type { OrderState, RelayMessage, ToolSchema } from '@/lib/protocol'

type ActivityEvent = {
  id: string
  timestamp: Date
  kind: 'proposed' | 'confirmed' | 'result' | 'rejected' | 'state_update'
  tool?: string
  detail: string
}

type UseRepSessionReturn = {
  roomId: string | null
  connected: boolean
  tools: ToolSchema[]
  pageState: OrderState | null
  activity: ActivityEvent[]
  join: (code: string) => void
  leave: () => void
  proposeAction: (tool: string, args: Record<string, unknown>) => void
}

export function useRepSession(): UseRepSessionReturn {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [tools, setTools] = useState<ToolSchema[]>([])
  const [pageState, setPageState] = useState<OrderState | null>(null)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const eventCounter = useRef(0)
  const previousStateHash = useRef<string>('')
  const disconnectRef = useRef<() => void>(() => {})

  const addEvent = useCallback(
    (kind: ActivityEvent['kind'], detail: string, tool?: string) => {
      eventCounter.current += 1
      const event: ActivityEvent = {
        id: `evt-${eventCounter.current}`,
        timestamp: new Date(),
        kind,
        tool,
        detail,
      }
      setActivity(prev => [event, ...prev])
    },
    [],
  )

  const handleMessage = useCallback(
    (data: string) => {
      try {
        const message = JSON.parse(data) as RelayMessage

        switch (message.type) {
          case 'session_state': {
            setTools(message.tools)
            setPageState(message.pageState)
            const stateHash = JSON.stringify(message.pageState)
            if (stateHash !== previousStateHash.current) {
              previousStateHash.current = stateHash
              addEvent('state_update', 'Customer page state synced')
            }
            break
          }
          case 'action_confirmed':
            addEvent(
              'confirmed',
              `Customer approved: ${message.tool}`,
              message.tool,
            )
            break
          case 'action_result':
            addEvent(
              'result',
              `Result from ${message.tool}: ${JSON.stringify(message.result)}`,
              message.tool,
            )
            break
          case 'action_rejected':
            addEvent(
              'rejected',
              `Customer declined: ${message.tool}${message.reason ? ` — ${message.reason}` : ''}`,
              message.tool,
            )
            break
          case 'session_ended':
            addEvent('state_update', 'Session ended by customer')
            disconnectRef.current()
            setRoomId(null)
            setPageState(null)
            setTools([])
            break
        }
      } catch {}
    },
    [addEvent],
  )

  const { send, connected, disconnect } = usePartySocket({
    roomId,
    onMessage: handleMessage,
    onConnect: () => {
      addEvent('state_update', 'Connected to customer session')
      send(JSON.stringify({ type: 'request_state' } satisfies RelayMessage))
    },
  })

  useLayoutEffect(() => {
    disconnectRef.current = disconnect
  })

  const join = useCallback((code: string) => {
    setRoomId(code.trim().toUpperCase())
    previousStateHash.current = ''
    setActivity([])
    setTools([])
    setPageState(null)
  }, [])

  const leave = useCallback(() => {
    send(
      JSON.stringify({
        type: 'session_ended',
        initiator: 'rep',
      } satisfies RelayMessage),
    )
    disconnect()
    setRoomId(null)
    previousStateHash.current = ''
    setActivity([])
    setTools([])
    setPageState(null)
  }, [send, disconnect])

  useEffect(() => {
    if (!connected || !roomId || pageState) return

    const requestTimer = setTimeout(() => {
      send(JSON.stringify({ type: 'request_state' } satisfies RelayMessage))
    }, 300)

    const interval = setInterval(() => {
      send(JSON.stringify({ type: 'request_state' } satisfies RelayMessage))
    }, 1500)

    return () => {
      clearTimeout(requestTimer)
      clearInterval(interval)
    }
  }, [connected, roomId, pageState, send])

  const proposeAction = useCallback(
    (tool: string, args: Record<string, unknown>) => {
      const message: RelayMessage = {
        type: 'propose_action',
        tool,
        args,
      }
      send(JSON.stringify(message))
      addEvent('proposed', `Proposed: ${tool}`, tool)
    },
    [send, addEvent],
  )

  return {
    roomId,
    connected,
    tools,
    pageState,
    activity,
    join,
    leave,
    proposeAction,
  }
}
