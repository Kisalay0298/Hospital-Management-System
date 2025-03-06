import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss({
      // Tailwind config goes here
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
      ],
      theme: {
        extend: {
          gridTemplateColumns: {
            'auto': 'repeat(auto-fill, minmax(200px, 1fr))', // Define custom grid template
          },
          colors: {
            primary: 'var(--color-primary)', // Use CSS variable
          },
        },
      },
    }),
  ],
  server: { port: 8702 }
})
