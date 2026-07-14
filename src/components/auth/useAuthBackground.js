import { useState, useEffect } from "react"

export const useAuthBackground = () => {
  const [backgroundUrl, setBackgroundUrl] = useState(
    `${import.meta.env.BASE_URL}images/background.png`
  )

  useEffect(() => {
    const canvas = document.createElement("canvas")
    if (canvas.toDataURL("image/webp").indexOf("webp") > -1) {
      setBackgroundUrl(`${import.meta.env.BASE_URL}images/background.webp`)
    }
  }, [])

  return backgroundUrl
}
