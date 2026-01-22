import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Point to your BACKEND's public folder
    // '..' goes up one level, then into 'backend', then 'public'
    outDir: "../Backend/public",

    // 2. Clear the old files automatically before building
    emptyOutDir: true,
  },
});
