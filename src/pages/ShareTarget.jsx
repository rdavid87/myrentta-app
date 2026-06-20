import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const ShareTarget = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const title = searchParams.get("title") || ""
    const text = searchParams.get("text") || ""
    const url = searchParams.get("url") || ""

    if (title || text || url) {
      console.log("Shared content received:", { title, text, url })
    }

    navigate("/dashboard", { replace: true })
  }, [searchParams, navigate])

  return null
}

export default ShareTarget