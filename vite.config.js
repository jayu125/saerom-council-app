import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon192.png", "icons/icon512.png"],
      manifest: {
        name: "새롬고 캘린더",
        short_name: "새롬 캘린더",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          {
            src: "icons/icon192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
