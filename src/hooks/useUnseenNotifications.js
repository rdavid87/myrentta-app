import { useEffect, useState } from "react"
import api from "../services/api"

const POLL_INTERVAL_MS = 60000

const buildStorageKey = (userKey) => `notifications_last_seen_${userKey}`

const toTimestamp = (notification) => Date.parse(notification?.fecha_envio)

const getLatestTimestamp = (items) =>
  items.reduce((latest, item) => {
    const time = toTimestamp(item)
    return Number.isFinite(time) && time > latest ? time : latest
  }, 0)

const readLastSeen = (storageKey) => {
  const stored = Number(localStorage.getItem(storageKey))
  return Number.isFinite(stored) && stored > 0 ? stored : null
}

const countNewerThan = (items, lastSeen) =>
  items.filter((item) => toTimestamp(item) > lastSeen).length

/**
 * Counts notifications sent after the last time the user opened the notifications page.
 * The "last seen" marker is stored per user in localStorage and compared against the
 * server timestamps, so client clock differences do not matter.
 */
const useUnseenNotifications = (userKey, isOnNotificationsPage) => {
  const [unseenCount, setUnseenCount] = useState(0)

  useEffect(() => {
    if (!userKey) return undefined

    const storageKey = buildStorageKey(userKey)
    let cancelled = false

    const refresh = async () => {
      try {
        const { data } = await api.get("/notificaciones/historial")
        if (cancelled) return
        const items = Array.isArray(data) ? data : []
        const latest = getLatestTimestamp(items)
        const lastSeen = readLastSeen(storageKey)

        // First visit, or user is viewing the page: everything counts as seen.
        if (lastSeen === null || isOnNotificationsPage) {
          if (latest > 0) localStorage.setItem(storageKey, String(latest))
          setUnseenCount(0)
          return
        }
        setUnseenCount(countNewerThan(items, lastSeen))
      } catch (error) {
        console.error("Error checking new notifications:", error)
      }
    }

    refresh()
    const intervalId = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [userKey, isOnNotificationsPage])

  return unseenCount
}

export default useUnseenNotifications
