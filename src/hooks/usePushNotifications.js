import { useEffect, useState } from "react"
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from "../services/push"

export const usePushNotifications = () => {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    if (supported) {
      const isSub = await isPushSubscribed()
      setSubscribed(isSub)
    }
  }

  const subscribe = async () => {
    try {
      const subscription = await subscribeToPush()
      setSubscribed(true)
      setPermission(Notification.permission)
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      throw error
    }
  }

  const unsubscribe = async () => {
    try {
      await unsubscribeFromPush()
      setSubscribed(false)
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      throw error
    }
  }

  return { supported, subscribed, permission, subscribe, unsubscribe }
}