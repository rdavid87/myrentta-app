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
          id: "https://myrentta.com/myrentta-app",
          name: "MyRentta",
          short_name: "MyRentta",
          description: "Administra sus bienes raices desde una aplicación.",
          theme_color: "#1aa3e1",
          background_color: "#111827",
          display: "standalone",
          orientation: "portrait",
          scope: "/myrentta-app/",
          start_url: "/myrentta-app/",
          lang: "es",
          categories: ["business", "finance", "productivity"],
          screenshots: [
            {
              src: "screenshots/screen-wide.png",
              sizes: "1024x1024",
              type: "image/png",
              form_factor: "wide",
            },
            {
              src: "screenshots/screen-narrow.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
          shortcuts: [
            {
              name: "Dashboard",
              url: "/myrentta-app/",
              description: "Ver resumen de arrendamientos",
              icons: [{ src: "android/launchericon-192x192.png", sizes: "192x192" }],
            },
            {
              name: "Pagos",
              url: "/myrentta-app/pagos",
              description: "Gestión de pagos",
              icons: [{ src: "android/launchericon-192x192.png", sizes: "192x192" }],
            },
            {
              name: "Apartamentos",
              url: "/myrentta-app/apartamentos",
              description: "Ver apartamentos",
              icons: [{ src: "android/launchericon-192x192.png", sizes: "192x192" }],
            },
            {
              name: "Arrendatarios",
              url: "/myrentta-app/arrendatarios",
              description: "Ver arrendatarios",
              icons: [{ src: "android/launchericon-192x192.png", sizes: "192x192" }],
            },
          ],
          icons: [
           {
             src: "android/launchericon-192x192.png",
             sizes: "192x192",
             type: "image/png",
           },
           {
             src: "android/launchericon-512x512.png",
             sizes: "512x512",
             type: "image/png",
           },
           {
             src: "ios/16.png",
             sizes: "16x16",
             type: "image/png",
           },
           {
             src: "ios/20.png",
             sizes: "20x20",
             type: "image/png",
           },
           {
             src: "ios/29.png",
             sizes: "29x29",
             type: "image/png",
           },
           {
             src: "ios/32.png",
             sizes: "32x32",
             type: "image/png",
           },
           {
             src: "ios/40.png",
             sizes: "40x40",
             type: "image/png",
           },
           {
             src: "ios/50.png",
             sizes: "50x50",
             type: "image/png",
           },
           {
             src: "ios/57.png",
             sizes: "57x57",
             type: "image/png",
           },
           {
             src: "ios/58.png",
             sizes: "58x58",
             type: "image/png",
           },
           {
             src: "ios/60.png",
             sizes: "60x60",
             type: "image/png",
           },
           {
             src: "ios/64.png",
             sizes: "64x64",
             type: "image/png",
           },
           {
             src: "ios/72.png",
             sizes: "72x72",
             type: "image/png",
           },
           {
             src: "ios/76.png",
             sizes: "76x76",
             type: "image/png",
           },
           {
             src: "ios/80.png",
             sizes: "80x80",
             type: "image/png",
           },
           {
             src: "ios/87.png",
             sizes: "87x87",
             type: "image/png",
           },
           {
             src: "ios/100.png",
             sizes: "100x100",
             type: "image/png",
           },
           {
             src: "ios/114.png",
             sizes: "114x114",
             type: "image/png",
           },
           {
             src: "ios/120.png",
             sizes: "120x120",
             type: "image/png",
           },
           {
             src: "ios/128.png",
             sizes: "128x128",
             type: "image/png",
           },
           {
             src: "ios/144.png",
             sizes: "144x144",
             type: "image/png",
           },
           {
             src: "ios/152.png",
             sizes: "152x152",
             type: "image/png",
           },
           {
             src: "ios/167.png",
             sizes: "167x167",
             type: "image/png",
           },
           {
             src: "ios/180.png",
             sizes: "180x180",
             type: "image/png",
           },
           {
             src: "ios/192.png",
             sizes: "192x192",
             type: "image/png",
           },
           {
             src: "ios/256.png",
             sizes: "256x256",
             type: "image/png",
           },
           {
             src: "ios/512.png",
             sizes: "512x512",
             type: "image/png",
           },
           {
             src: "ios/1024.png",
             sizes: "1024x1024",
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