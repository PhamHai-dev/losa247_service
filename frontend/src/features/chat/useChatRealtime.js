import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL, chatService } from './chatService'

export function useChatRealtime({ sessionId, sessionToken, role = 'customer', enabled = true, onMessage, onModeChange, onReconnect } = {}) {
  const [connected, setConnected] = useState(false)
  const callbacks = useRef({ onMessage, onModeChange, onReconnect })
  const seen = useRef(new Set())
  callbacks.current = { onMessage, onModeChange, onReconnect }

  useEffect(() => {
    if (!enabled || (role === 'customer' && (!sessionId || !sessionToken))) {
      setConnected(false)
      return undefined
    }
    let source
    let cancelled = false
    const connect = async () => {
      try {
        const url = role === 'admin'
          ? `${API_BASE_URL}/admin/chat/events?ticket=${encodeURIComponent(await chatService.createStreamTicket())}`
          : `${API_BASE_URL}/chat/sessions/${sessionId}/events?token=${encodeURIComponent(sessionToken)}`
        if (cancelled) return
        source = new EventSource(url, { withCredentials: true })
        source.addEventListener('stream.connected', () => { setConnected(true); callbacks.current.onReconnect?.() })
        source.addEventListener('message.created', (event) => {
          const envelope = JSON.parse(event.data)
          const id = envelope.data?._id || envelope.data?.id
          if (id && seen.current.has(id)) return
          if (id) seen.current.add(id)
          callbacks.current.onMessage?.(envelope.data, envelope)
        })
        source.addEventListener('session.mode_changed', (event) => {
          const envelope = JSON.parse(event.data)
          callbacks.current.onModeChange?.(envelope.data, envelope)
        })
        source.onerror = () => setConnected(false)
      } catch { setConnected(false) }
    }
    connect()
    return () => { cancelled = true; source?.close(); setConnected(false) }
  }, [enabled, role, sessionId, sessionToken])

  return { connected }
}
