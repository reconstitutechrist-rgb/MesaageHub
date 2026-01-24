import { createContext, useContext, useState, useCallback } from 'react'
import { CallModal } from '@/components/common/CallModal'

const CallContext = createContext(null)

export function CallProvider({ children }) {
  const [call, setCall] = useState({
    isActive: false,
    status: 'idle', // idle, ringing, connected
    contact: null,
  })

  const startCall = useCallback((contact) => {
    setCall({
      isActive: true,
      status: 'ringing',
      contact,
    })

    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCall((prev) => {
        if (prev.isActive) {
          return { ...prev, status: 'connected' }
        }
        return prev
      })
    }, 2000)
  }, [])

  const endCall = useCallback(() => {
    setCall({
      isActive: false,
      status: 'idle',
      contact: null,
    })
  }, [])

  return (
    <CallContext.Provider value={{ call, startCall, endCall }}>
      {children}
      <CallModal call={call} onEndCall={endCall} />
    </CallContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}
