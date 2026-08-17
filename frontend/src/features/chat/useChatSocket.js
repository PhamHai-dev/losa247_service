import { useEffect, useRef, useState } from 'react'
import { getSocket } from '../../services/socketClient'

export function useChatSocket(sessionId, {
  role = 'customer', onMessage, onModeChange, onPermissionError, enabled = true,
} = {}) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const onModeRef = useRef(onModeChange)
  const onPermissionErrorRef = useRef(onPermissionError)
  onMessageRef.current = onMessage
  onModeRef.current = onModeChange
  onPermissionErrorRef.current = onPermissionError

  useEffect(() => {
    if (!enabled) {
      setConnected(false)
      return undefined
    }
    const socket = getSocket('/chat')
    socketRef.current = socket
    if (!socket.connected) socket.connect()

    const handleConnect = () => {
      setConnected(true)
      if (sessionId) socket.emit('join_session', { sessionId })
    }
    const handleDisconnect = () => setConnected(false)
    const handleNewMessage = (msg) => onMessageRef.current?.(msg)
    const handleBotReply = (msg) => onMessageRef.current?.(msg)
    const handleModeChange = (payload) => onModeRef.current?.(payload)
    const handlePermissionError = (payload) => onPermissionErrorRef.current?.(payload)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('new_message', handleNewMessage)
    socket.on('bot_reply', handleBotReply)
    socket.on('session_mode_changed', handleModeChange)
    socket.on('permission_error', handlePermissionError)
    if (socket.connected) handleConnect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('new_message', handleNewMessage)
      socket.off('bot_reply', handleBotReply)
      socket.off('session_mode_changed', handleModeChange)
      socket.off('permission_error', handlePermissionError)
    }
  }, [sessionId, enabled])

  const joinSession = (id) => socketRef.current?.emit('join_session', { sessionId: id })
  const sendMessage = (content, attachments = [], overrideSessionId = null) => {
    const socket = socketRef.current
    const targetSessionId = overrideSessionId || sessionId
    if (!enabled || !socket || (!content?.trim() && !attachments.length) || !targetSessionId) return
    const event = role === 'admin' ? 'admin_message' : 'customer_message'
    const clientMessageId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    socket.emit(event, { sessionId: targetSessionId, clientMessageId, content, attachments }, (response) => {
      if (response?.success === false) onPermissionErrorRef.current?.(response.error)
    })
  }
  const requestHuman = () => {
    if (enabled) socketRef.current?.emit('request_human', { sessionId })
  }

  return { connected, sendMessage, requestHuman, joinSession }
}
