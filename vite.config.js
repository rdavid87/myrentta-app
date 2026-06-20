import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  base: "/myrentta-app/",
  plugins: [
    react(),
    VitePWA({
      srcDir: "src",
      filename: "pwabuilder-sw.js",
      strategies: "injectManifest",
      registerType: "autoUpdate",
      manifest: false,
      injectRegister: "script",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:9002/api",
        changeOrigin: true,
      },
    },
  },
})