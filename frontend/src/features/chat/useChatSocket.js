import { useEffect, useRef, useState } from 'react'
import { getSocket } from '../../services/socketClient'

// Hook kết nối namespace /chat theo đúng event backend hiện có:
//  - emit: join_session, customer_message, admin_message, request_human
//  - listen: new_message, bot_reply, session_mode_changed
export function useChatSocket(sessionId, { role = 'customer', onMessage, onModeChange } = {}) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const onModeRef = useRef(onModeChange)
  onMessageRef.current = onMessage
  onModeRef.current = onModeChange

  useEffect(() => {
    const socket = getSocket('/chat')
    socketRef.current = socket
    if (!socket.connected) socket.connect()

    const handleConnect = () => {
      setConnected(true)
      if (sessionId) {
        socket.emit('join_session', { sessionId })
      }
    }
    const handleDisconnect = () => setConnected(false)
    const handleNewMessage = (msg) => onMessageRef.current?.(msg)
    const handleBotReply = (msg) => onMessageRef.current?.(msg)
    const handleModeChange = (payload) => onModeRef.current?.(payload)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('new_message', handleNewMessage)
    socket.on('bot_reply', handleBotReply)
    socket.on('session_mode_changed', handleModeChange)

    if (socket.connected) handleConnect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('new_message', handleNewMessage)
      socket.off('bot_reply', handleBotReply)
      socket.off('session_mode_changed', handleModeChange)
    }
  }, [sessionId])

  const joinSession = (id) => {
    socketRef.current?.emit('join_session', { sessionId: id })
  }

  const sendMessage = (content, attachments = [], overrideSessionId = null) => {
    const socket = socketRef.current
    const targetSessionId = overrideSessionId || sessionId
    if (!socket || (!content?.trim() && !attachments.length) || !targetSessionId) return
    const event = role === 'admin' ? 'admin_message' : 'customer_message'
    socket.emit(event, { sessionId: targetSessionId, content, attachments })
  }

  const requestHuman = () => {
    socketRef.current?.emit('request_human', { sessionId })
  }

  return { connected, sendMessage, requestHuman, joinSession }
}
