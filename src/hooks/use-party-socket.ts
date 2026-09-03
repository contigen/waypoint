'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import PartySocket from 'partysocket'

function getPartyHost(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_PARTY_HOST || `${window.location.hostname}:1999`
    )
  }
  return 'localhost:1999'
}

type UsePartySocketOptions = {
  roomId: string | null
  onMessage: (data: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

type UsePartySocketReturn = {
  send: (data: string) => void
  connected: boolean
  disconnect: () => void
}

export function usePartySocket({
  roomId,
  onMessage,
  onConnect,
  onDisconnect,
}: UsePartySocketOptions): UsePartySocketReturn {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<PartySocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)

  useLayoutEffect(() => {
    onMessageRef.current = onMessage
    onConnectRef.current = onConnect
    onDisconnectRef.current = onDisconnect
  })

  useEffect(() => {
    if (!roomId) return

    const socket = new PartySocket({
      host: getPartyHost(),
      room: roomId,
    })
    socketRef.current = socket

    socket.addEventListener('open', () => {
      setConnected(true)
      onConnectRef.current?.()
    })

    socket.addEventListener('message', event => {
      onMessageRef.current(event.data as string)
    })

    socket.addEventListener('close', () => {
      setConnected(false)
      onDisconnectRef.current?.()
    })

    return () => {
      socket.close()
      socketRef.current = null
      setConnected(false)
    }
  }, [roomId])

  const send = useCallback((data: string) => {
    socketRef.current?.send(data)
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
    setConnected(false)
  }, [])

  return { send, connected, disconnect }
}
