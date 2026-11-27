import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server runs on http://localhost:5173 (change with: npm run dev -- --port 5174).
// If you change the port, also add the new origin to CORS_ORIGINS in backend/.env.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
