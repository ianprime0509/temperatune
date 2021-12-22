import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      includeAssets: [
        "favicon.ico",
        "icon.svg",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Temperatune",
        short_name: "Temperatune",
        start_url: "./index.html",
        display: "standalone",
        theme_color: "#1e9be9",
        background_color: "#eeeeee",
        orientation: "portrait",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
