import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow non-VITE_ env vars to be exposed to import.meta.env in the client.
  // Example: GEMINI_API_KEY in a local .env file.
  envPrefix: ['VITE_', 'GEMINI_'],
})
