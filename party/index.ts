import type * as Party from 'partykit/server'

export default class RelayServer implements Party.Server {
  lastState: string | null = null

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'connected', id: conn.id }))
    if (this.lastState) {
      conn.send(this.lastState)
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const parsed = JSON.parse(message) as { type?: string }
      if (parsed.type === 'session_state') {
        this.lastState = message
      } else if (parsed.type === 'session_ended') {
        this.lastState = null
      }
    } catch {}
    this.room.broadcast(message, [sender.id])
  }
}

RelayServer satisfies Party.Worker
