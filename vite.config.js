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
      manifest: {
        name: "MyRentta",
        short_name: "MyRentta",
        description: "Sistema de gestión de arrendamientos",
        theme_color: "#1f2937",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/myrentta-app/",
        start_url: "/myrentta-app/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
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