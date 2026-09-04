import { useSyncExternalStore } from 'react'

// Subscribes to the browser's connectivity state. Returns `true` when the
// browser believes it has a network connection, `false` otherwise.
//
// `navigator.onLine` is a best-effort signal (a captive portal or a dead
// backend can still report `true`), so screens that show money must still
// handle failed requests explicitly. This hook only powers the "you are
// offline" affordance, it is not a substitute for real request error
// handling.

function subscribe(callback) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  // Assume online during SSR / prerender so nothing renders a false alarm.
  return true
}

export default function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
